import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nunjucks from 'nunjucks';
import { AppDataSource } from './db/data-source.js';
import { ensureDb } from './db/bootstrap.js';
import { formatDate, formatMoney, formatStatus } from './view/format.js';
import { listTable } from './controller/table.js';
import { showForm } from './controller/form.js';
import { relatedInfo } from './controller/record.js';
import { showProfile } from './controller/profile.js';
import { listUsers } from './controller/admin-user.js';
import { newUser, editUser } from './controller/admin-user-form.js';
import { showEvent } from './controller/event.js';
import apiRouter from './api/router.js';
import { authLocals, requireAuth, requireRole } from './auth/middleware.js';
import passport from './auth/passport.js';
import { ROLES } from './auth/roles.js';
import { renderError } from './lib/render-error.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const app = express();

if (!process.env.SESSION_SECRET && isProduction) {
  throw new Error('SESSION_SECRET не заданий. Додайте його в змінні середовища.');
}

app.set('trust proxy', 1);

const viewsDir = path.join(currentDir, 'view');
const nunjucksEnv = nunjucks.configure(viewsDir, {
  autoescape: true,
  express: app,
  watch: !isProduction,
  noCache: !isProduction
});

nunjucksEnv.addFilter('date', formatDate);
nunjucksEnv.addFilter('money', formatMoney);
nunjucksEnv.addFilter('status', formatStatus);

app.set('view engine', 'njk');
app.set('views', viewsDir);

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'DENY');
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "script-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; base-uri 'self'"
  );
  next();
});

app.use(express.static(path.join(currentDir, 'asset'), {
  maxAge: 0,
  etag: true
}));

// Статика віддається без бази. Решта запитів чекає на PostgreSQL один раз
// на інстанс: якщо база недоступна, сторінка не падає з 500 на кожен CSS.
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    return next();
  } catch (error) {
    console.error('[db] Не вдалося підключитися:', error.message);
    if (req.path.startsWith('/api/')) {
      return res.status(503).json({ message: 'База даних тимчасово недоступна.' });
    }
    return res.status(503).send('База даних тимчасово недоступна. Спробуйте пізніше.');
  }
});

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

const PgStore = connectPgSimple(session);
const sessionPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: Number(process.env.DB_POOL_MAX) || 3
});

const sessionStore = new PgStore({
  pool: sessionPool,
  tableName: 'user_sessions',
  createTableIfMissing: false,
  pruneSessionInterval: 60 * 15
});

app.use(session({
  name: 'podiya.sid',
  secret: process.env.SESSION_SECRET || 'podiya-local-only-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(authLocals);

// HTML не кешуємо: інакше після деплою браузер показує стару сторінку
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
  next();
});

const staff = requireRole(ROLES.ADMIN, ROLES.ORGANIZER);
const admin = requireRole(ROLES.ADMIN);

app.get('/favicon.ico', (req, res) => {
  res.redirect(301, '/favicon.svg');
});

app.get('/profile', requireAuth, showProfile);
app.get('/users', admin, listUsers);
app.get('/users/new', admin, newUser);
app.get('/users/:id/edit', admin, editUser);
app.get('/', listTable('events'));
app.get('/events', listTable('events'));
app.get('/events/new', staff, showForm('events'));
app.get('/events/:id', showEvent);
app.get('/events/:id/edit', staff, showForm('events'));
app.get('/tickets', requireAuth, listTable('tickets'));
app.get('/tickets/new', staff, showForm('tickets'));
app.get('/tickets/:id/edit', staff, showForm('tickets'));

for (const key of ['locations', 'organizers', 'categories', 'clients']) {
  app.get(`/${key}`, admin, listTable(key));
  app.get(`/${key}/new`, admin, showForm(key));
  app.get(`/${key}/:id/edit`, admin, showForm(key));
}

app.get('/api/users/:id/related', admin, (req, res) => {
  res.json({ total: 0, items: [] });
});
app.get('/api/:resource/:id/related', requireAuth, relatedInfo());
app.get('/api/health', async (req, res) => {
  try {
    const [row] = await AppDataSource.query('select now() as time');
    res.json({ status: 'ok', database: 'postgres', time: row.time });
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});
app.use('/api', apiRouter);

app.get('/health', async (req, res) => {
  const repositories = [
    ['locations', 'Location'],
    ['organizers', 'Organizer'],
    ['clients', 'Client'],
    ['events', 'Event'],
    ['ticketCategories', 'TicketCategory'],
    ['tickets', 'Ticket'],
    ['users', 'User']
  ];
  const counts = {};
  for (const [key, entity] of repositories) {
    counts[key] = await AppDataSource.getRepository(entity).count();
  }
  res.json({ status: 'ok', database: 'postgres', counts });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Маршрут не знайдено.' });
  }
  renderError(req, res, 404, 'Сторінку не знайдено', 'Такої сторінки не існує.');
});

app.use((error, req, res, next) => {
  console.error(error);
  if (req.path.startsWith('/api/')) {
    const status = error.status || 500;
    const message = status === 400 ? 'Некоректний JSON у запиті.' : 'Внутрішня помилка сервера.';
    return res.status(status).json({ message });
  }
  renderError(req, res, 500, 'Помилка сервера', 'Не вдалося обробити запит. Спробуйте пізніше.');
});

export default app;
