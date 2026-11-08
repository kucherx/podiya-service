import { Not } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';
import { navigationFor } from '../view/navigation.js';
import { messageFromQuery } from '../lib/messages.js';
import { ROLES } from '../auth/roles.js';
import { nextTicketCode } from '../service/ticket-code.js';
import { occupiedCount } from '../service/ticket-stock.js';
import { wantsJson } from '../lib/request.js';
import { renderError } from '../lib/render-error.js';

function repository(name) {
  return AppDataSource.getRepository(name);
}

function isManager(role) {
  return role === ROLES.ADMIN || role === ROLES.ORGANIZER;
}

function canSeeEvent(event, role, user) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.ORGANIZER) return event.organizer?.id === user.organizer?.id;
  return event.status === 'published';
}

async function loadEvent(id) {
  return repository('Event').findOne({
    where: { id },
    relations: { location: true, organizer: true, categories: true }
  });
}

function withTotals(tickets) {
  return tickets.map((ticket) => ({
    ...ticket,
    total: Number(ticket.price || 0) * Number(ticket.quantity || 1)
  }));
}

function buyError(req, res, eventId, status, code, message) {
  if (wantsJson(req)) return res.status(status).json({ ok: false, field: 'quantity', message });
  return res.redirect(`/events/${eventId}?error=${code}`);
}

export async function showEvent(req, res) {
  const id = Number(req.params.id);
  const event = Number.isInteger(id) ? await loadEvent(id) : null;
  if (!event) return renderError(req, res, 404, 'Подію не знайдено', 'Такої події не існує.');

  const role = req.user?.role || ROLES.GUEST;
  if (!canSeeEvent(event, role, req.user)) {
    return renderError(req, res, 403, 'Доступ заборонено', 'У вас немає доступу до цієї події.');
  }

  const categories = await Promise.all(event.categories.map(async (category) => ({
    ...category,
    available: Math.max(0, category.quantity - await occupiedCount(event.id, category.id))
  })));
  const manager = isManager(role);
  const tickets = manager
    ? withTotals(await repository('Ticket').find({
      where: { event: { id: event.id }, status: Not('available') },
      relations: { category: true, client: true },
      order: { code: 'ASC' }
    }))
    : [];
  const ownTickets = role === ROLES.CLIENT && req.user.client
    ? withTotals(await repository('Ticket').find({
      where: { event: { id: event.id }, client: { id: req.user.client.id } },
      relations: { category: true },
      order: { code: 'ASC' }
    }))
    : [];

  return res.render('event', {
    title: event.title,
    active: 'events',
    nav: navigationFor(role),
    event,
    categories,
    tickets,
    ownTickets,
    manager,
    canBuy: role === ROLES.CLIENT && Boolean(req.user.client) && event.status === 'published',
    highlightTicketId: Number(req.query.ticket) || null,
    message: messageFromQuery(req.query)
  });
}

export async function buyTicket(req, res) {
  const eventId = Number(req.params.id);
  const categoryId = Number(req.body.categoryId);
  const count = Number(req.body.quantity || 1);
  const event = Number.isInteger(eventId) ? await loadEvent(eventId) : null;
  const category = event?.categories.find((item) => item.id === categoryId);
  const client = req.user?.client;

  if (!event || event.status !== 'published' || !category || !client) {
    return buyError(req, res, eventId, 400, 'notAvailable', 'Квиток зараз недоступний.');
  }
  if (!Number.isInteger(count) || count < 1) {
    return buyError(req, res, eventId, 400, 'notAvailable', 'Вкажіть коректну кількість квитків.');
  }

  const available = category.quantity - await occupiedCount(eventId, categoryId);
  if (available <= 0) {
    return buyError(req, res, eventId, 409, 'soldOut', 'Квитки цієї категорії закінчилися.');
  }
  if (count > available) {
    return buyError(req, res, eventId, 409, 'notEnough', `Доступно лише ${available} квитків.`);
  }

  const ticket = repository('Ticket').create({
    code: await nextTicketCode(eventId, categoryId),
    status: 'reserved',
    price: category.price,
    quantity: count,
    purchasedAt: new Date(),
    event: { id: eventId },
    category: { id: categoryId },
    client: { id: client.id }
  });
  await repository('Ticket').save(ticket);

  const redirect = `/events/${eventId}?notice=reserved`;
  if (wantsJson(req)) return res.json({ ok: true, redirect });
  return res.redirect(redirect);
}
