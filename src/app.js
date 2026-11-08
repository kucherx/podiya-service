import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { engine } from 'express-handlebars';
import { AppDataSource } from './db/data-source.js';
import { listTable } from './controller/table.js';
import { showForm, saveForm } from './controller/form.js';
import { deleteRecord, relatedInfo } from './controller/record.js';
import { formConfig } from './view/forms/index.js';
import { navigation } from './view/navigation.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();

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

app.get('/favicon.ico', (req, res) => {
  res.redirect(301, '/favicon.svg');
});

app.get('/', listTable('events'));

for (const key of Object.keys(formConfig)) {
  app.get(`/${key}`, listTable(key));
  app.get(`/${key}/new`, showForm(key));
  app.get(`/${key}/:id/edit`, showForm(key));
  app.post(`/${key}`, saveForm(key));
  app.post(`/${key}/:id`, saveForm(key));
  app.post(`/${key}/:id/delete`, deleteRecord(key));
}

app.get('/api/:resource/:id/related', relatedInfo());

app.get('/health', async (req, res) => {
  const repositories = [
    ['locations', 'Location'],
    ['organizers', 'Organizer'],
    ['clients', 'Client'],
    ['events', 'Event'],
    ['ticketCategories', 'TicketCategory'],
    ['tickets', 'Ticket']
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
    nav: navigation
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
    nav: navigation
  });
});

export default app;
