import { AppDataSource } from '../db/data-source.js';
import { ROLES } from '../auth/roles.js';
import { wantsJson } from '../lib/request.js';
import { renderError } from '../lib/render-error.js';

function repository() {
  return AppDataSource.getRepository('Ticket');
}

async function loadTicket(id) {
  return repository().findOne({
    where: { id },
    relations: { event: { organizer: true }, category: true, client: true }
  });
}

function canManage(req, ticket) {
  if (req.user.role === ROLES.ADMIN) return true;
  return req.user.role === ROLES.ORGANIZER
    && ticket.event?.organizer?.id === req.user.organizer?.id;
}

function finish(req, res, ticket, notice, error) {
  const target = `/events/${ticket.event.id}?${error ? `error=${error}` : `notice=${notice}`}`;
  if (wantsJson(req)) {
    return error
      ? res.status(400).json({ ok: false, message: 'Цю дію зараз виконати неможливо.' })
      : res.json({ ok: true, redirect: target });
  }
  return res.redirect(target);
}

async function loadForAction(req, res) {
  const ticket = await loadTicket(Number(req.params.id));
  if (ticket) return ticket;
  renderError(req, res, 404, 'Квиток не знайдено', 'Такого квитка не існує.');
  return null;
}

function requireManage(req, res, ticket) {
  if (canManage(req, ticket)) return true;
  renderError(req, res, 403, 'Доступ заборонено', 'У вас немає прав для цієї дії.');
  return false;
}

export async function confirmPayment(req, res) {
  const ticket = await loadForAction(req, res);
  if (!ticket || !requireManage(req, res, ticket)) return;
  if (ticket.status === 'cancelled') return finish(req, res, ticket, null, 'notAvailable');

  ticket.status = 'sold';
  ticket.paidAt = new Date();
  await repository().save(ticket);
  return finish(req, res, ticket, 'paid');
}

export async function checkInTicket(req, res) {
  const ticket = await loadForAction(req, res);
  if (!ticket || !requireManage(req, res, ticket)) return;
  if (ticket.status !== 'sold') return finish(req, res, ticket, null, 'notAvailable');

  ticket.checkedInAt = new Date();
  await repository().save(ticket);
  return finish(req, res, ticket, 'checkedIn');
}

export async function cancelTicket(req, res) {
  const ticket = await loadForAction(req, res);
  if (!ticket) return;

  const ownClient = req.user.role === ROLES.CLIENT
    && ticket.client?.id === req.user.client?.id
    && ticket.status === 'reserved';
  if (!canManage(req, ticket) && !ownClient) {
    return renderError(req, res, 403, 'Доступ заборонено', 'У вас немає прав для цієї дії.');
  }

  ticket.status = 'cancelled';
  ticket.checkedInAt = null;
  await repository().save(ticket);
  return finish(req, res, ticket, 'cancelled');
}
