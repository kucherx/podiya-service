import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { canWriteRecord } from '../access.js';
import { jsonError, parseId } from '../helpers.js';

function repository() {
  return AppDataSource.getRepository('Ticket');
}

async function loadTicket(id) {
  return repository().findOne({
    where: { id },
    relations: { event: { organizer: true }, category: true, client: true }
  });
}

function finish(res, ticket, notice) {
  return res.json({ ok: true, redirect: `/events/${ticket.event.id}?notice=${notice}` });
}

function roleOf(req) {
  return req.user?.role || ROLES.GUEST;
}

export async function pay(req, res) {
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Квиток не знайдено.');
  const ticket = await loadTicket(id);
  if (!ticket) return jsonError(res, 404, 'Квиток не знайдено.');
  if (!canWriteRecord(roleOf(req), 'tickets', ticket, req.user, 'update')) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }
  if (ticket.status === 'cancelled') return jsonError(res, 409, 'Скасований квиток не можна оплатити.');

  ticket.status = 'sold';
  ticket.paidAt = new Date();
  await repository().save(ticket);
  return finish(res, ticket, 'paid');
}

export async function checkIn(req, res) {
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Квиток не знайдено.');
  const ticket = await loadTicket(id);
  if (!ticket) return jsonError(res, 404, 'Квиток не знайдено.');
  if (!canWriteRecord(roleOf(req), 'tickets', ticket, req.user, 'update')) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }
  if (ticket.status !== 'sold') return jsonError(res, 409, 'Спочатку підтвердіть оплату.');

  ticket.checkedInAt = new Date();
  await repository().save(ticket);
  return finish(res, ticket, 'checkedIn');
}

export async function cancel(req, res) {
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Квиток не знайдено.');
  const ticket = await loadTicket(id);
  if (!ticket) return jsonError(res, 404, 'Квиток не знайдено.');

  const ownClient = roleOf(req) === ROLES.CLIENT
    && ticket.client?.id === req.user.client?.id
    && ticket.status === 'reserved';
  if (!canWriteRecord(roleOf(req), 'tickets', ticket, req.user, 'delete') && !ownClient) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }

  ticket.status = 'cancelled';
  ticket.checkedInAt = null;
  await repository().save(ticket);
  return finish(res, ticket, 'cancelled');
}
