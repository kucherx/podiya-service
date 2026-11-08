import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { engine } from 'express-handlebars';
import { AppDataSource } from './db/data-source.js';
import { listTable } from './controller/table.js';
import { showForm, saveForm } from './controller/form.js';
import { deleteRecord, relatedInfo } from './controller/record.js';
import { postLogin, postRegister, logout } from './controller/auth.js';
import { showProfile, updateProfile, updatePassword } from './controller/profile.js';
import { authLocals, requireAuth, requireGuest, requireRole } from './auth/middleware.js';
import passport from './auth/passport.js';
import { ROLES } from './auth/roles.js';
import { navigationFor } from './view/navigation.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const staff = requireRole(ROLES.ADMIN, ROLES.ORGANIZER);
const admin = requireRole(ROLES.ADMIN);

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(currentDir, 'view', 'layouts'),
  partialsDir: path.join(currentDir, 'view', 'partials'),
  helpers: {
    eq: (left, right) => left === right
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(currentDir, 'view'));

app.use(express.static(path.join(currentDir, 'asset')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'podiya-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(authLocals);

app.get('/favicon.ico', (req, res) => {
  res.redirect(301, '/favicon.svg');
});

app.post('/auth/login', requireGuest, postLogin);
app.post('/auth/register', requireGuest, postRegister);
app.post('/auth/logout', requireAuth, logout);

app.get('/profile', requireAuth, showProfile);
app.post('/profile', requireAuth, updateProfile);
app.post('/profile/password', requireAuth, updatePassword);

app.get('/', listTable('events'));
app.get('/events', listTable('events'));
app.get('/events/new', staff, showForm('events'));
app.get('/events/:id/edit', staff, showForm('events'));
app.post('/events', staff, saveForm('events'));
app.post('/events/:id', staff, saveForm('events'));
app.post('/events/:id/delete', staff, deleteRecord('events'));

app.get('/tickets', requireAuth, listTable('tickets'));
app.get('/tickets/new', staff, showForm('tickets'));
app.get('/tickets/:id/edit', staff, showForm('tickets'));
app.post('/tickets', staff, saveForm('tickets'));
app.post('/tickets/:id', staff, saveForm('tickets'));
app.post('/tickets/:id/delete', staff, deleteRecord('tickets'));

for (const key of ['locations', 'organizers', 'categories', 'clients']) {
  app.get(`/${key}`, admin, listTable(key));
  app.get(`/${key}/new`, admin, showForm(key));
  app.get(`/${key}/:id/edit`, admin, showForm(key));
  app.post(`/${key}`, admin, saveForm(key));
  app.post(`/${key}/:id`, admin, saveForm(key));
  app.post(`/${key}/:id/delete`, admin, deleteRecord(key));
}

app.get('/api/:resource/:id/related', requireAuth, relatedInfo());

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

  res.json({ status: 'ok', database: 'sqlite', counts });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Маршрут не знайдено.' });
  }
  res.status(404).render('error', {
    title: 'Сторінку не знайдено',
    message: 'Такої сторінки не існує.',
    active: null,
    nav: navigationFor(req.user?.role || ROLES.GUEST)
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ message: 'Внутрішня помилка сервера.' });
  }
  res.status(500).render('error', {
    title: 'Помилка сервера',
    message: 'Не вдалося обробити запит. Спробуйте пізніше.',
    active: null,
    nav: navigationFor(req.user?.role || ROLES.GUEST)
  });
});

export default app;
