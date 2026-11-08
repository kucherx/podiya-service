import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppDataSource } from './db/data-source.js';
import { renderMainPage } from './view/main-page.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.static(path.join(currentDir, 'asset')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/favicon.ico', (req, res) => {
  res.redirect(301, '/favicon.svg');
});

app.get('/', async (req, res) => {
  const events = await AppDataSource.getRepository('Event').find({
    relations: { location: true, organizer: true },
    order: { startsAt: 'ASC' }
  });

  res.type('html').send(renderMainPage(events));
});

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
