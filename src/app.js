import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { engine } from 'express-handlebars';
import { AppDataSource } from './db/data-source.js';
import { formatDate, formatMoney, formatStatus } from './view/format.js';
import { listTable } from './controller/table.js';
import { showForm, saveForm } from './controller/form.js';
import { deleteRecord, relatedInfo } from './controller/record.js';
import { postLogin, postRegister, logout } from './controller/auth.js';
import { showProfile, updateProfile, updatePassword } from './controller/profile.js';
import { listUsers, deleteUser, resetPassword } from './controller/admin-user.js';
import { newUser, editUser, saveUser } from './controller/admin-user-form.js';
import { showEvent, buyTicket } from './controller/event.js';
import { confirmPayment, checkInTicket, cancelTicket } from './controller/ticket-action.js';
import apiRouter from './api/router.js';
import { authLocals, requireAuth, requireGuest, requireRole } from './auth/middleware.js';
import passport from './auth/passport.js';
import { ROLES } from './auth/roles.js';
import { renderError } from './lib/render-error.js';
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
    eq: (left, right) => left === right,
    formatDate,
    formatMoney,
    formatStatus
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
app.get('/users', admin, listUsers);
app.get('/users/new', admin, newUser);
app.post('/users', admin, saveUser);
app.get('/users/:id/edit', admin, editUser);
app.post('/users/:id', admin, saveUser);
app.post('/users/:id/delete', admin, deleteUser);
app.post('/users/:id/password', admin, resetPassword);
app.get('/', listTable('events'));
app.get('/events', listTable('events'));
app.get('/events/new', staff, showForm('events'));
app.get('/events/:id', showEvent);
app.get('/events/:id/edit', staff, showForm('events'));
app.post('/events', staff, saveForm('events'));
app.post('/events/:id/buy', requireRole(ROLES.CLIENT), buyTicket);
app.post('/events/:id', staff, saveForm('events'));
app.post('/events/:id/delete', staff, deleteRecord('events'));
app.get('/tickets', requireAuth, listTable('tickets'));
app.get('/tickets/new', staff, showForm('tickets'));
app.get('/tickets/:id/edit', staff, showForm('tickets'));
app.post('/tickets', staff, saveForm('tickets'));
app.post('/tickets/:id/pay', staff, confirmPayment);
app.post('/tickets/:id/check-in', staff, checkInTicket);
app.post('/tickets/:id/cancel', requireAuth, cancelTicket);
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
app.get('/api/users/:id/related', admin, (req, res) => {
  res.json({ total: 0, items: [] });
});
app.get('/api/:resource/:id/related', requireAuth, relatedInfo());
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
  res.json({ status: 'ok', database: 'sqlite', counts });
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
    return res.status(500).json({ message: 'Внутрішня помилка сервера.' });
  }
  renderError(req, res, 500, 'Помилка сервера', 'Не вдалося обробити запит. Спробуйте пізніше.');
});
export default app;
