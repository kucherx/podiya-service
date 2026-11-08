import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { engine } from 'express-handlebars';
import { AppDataSource } from './db/data-source.js';
import { listTable } from './controller/table.controller.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(currentDir, 'view', 'layouts'),
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
app.get('/events', listTable('events'));
app.get('/locations', listTable('locations'));
app.get('/organizers', listTable('organizers'));
app.get('/categories', listTable('categories'));
app.get('/tickets', listTable('tickets'));
app.get('/clients', listTable('clients'));

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
  res.status(404).json({ message: 'Маршрут не знайдено' });
});

export default app;
