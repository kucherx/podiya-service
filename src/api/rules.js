import { AppDataSource } from '../db/data-source.js';
import { ROLES } from '../auth/roles.js';
import { occupiedCount } from '../service/ticket-stock.js';
import { formatInputDateTime } from '../view/format.js';
import { ApiError } from './helpers.js';

async function eventById(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return AppDataSource.getRepository('Event').findOne({
    where: { id },
    relations: { organizer: true }
  });
}

async function categoryById(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return AppDataSource.getRepository('TicketCategory').findOneBy({ id });
}

export async function applyCreateRules(role, key, raw, user) {
  if (key === 'events' && role === ROLES.ORGANIZER) {
    if (!user.organizer) throw new ApiError(403, 'У вашого акаунта немає профілю організатора.');
    raw.organizer = user.organizer.id;
  }

  if (key !== 'tickets') return;

  if (role === ROLES.ORGANIZER) {
    if (!user.organizer) throw new ApiError(403, 'У вашого акаунта немає профілю організатора.');
    if (!raw.event) return;
    const event = await eventById(raw.event);
    if (!event) throw new ApiError(422, 'Оберіть коректну подію.');
    if (event.organizer?.id !== user.organizer.id) {
      throw new ApiError(403, 'Оберіть подію, якою ви керуєте.');
    }
  }

  if (role === ROLES.CLIENT) {
    if (!user.client) throw new ApiError(403, 'У вашого акаунта немає профілю клієнта.');
    const event = await eventById(raw.event);
    if (!event || event.status !== 'published') {
      throw new ApiError(403, 'Квиток зараз недоступний.');
    }
    raw.client = user.client.id;
    raw.status = 'reserved';
    raw.purchasedAt = formatInputDateTime(new Date());
    const category = await categoryById(raw.category);
    if (!category) throw new ApiError(422, 'Оберіть коректну категорію квитка.');
    raw.price = category.price;
    const available = category.quantity - await occupiedCount(event.id, category.id);
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(422, 'Вкажіть коректну кількість квитків.');
    }
    if (available <= 0) throw new ApiError(409, 'Квитки цієї категорії закінчилися.');
    if (quantity > available) throw new ApiError(409, `Доступно лише ${available} квитків.`);
  }
}

export async function applyUpdateRules(role, key, raw, user) {
  if (role !== ROLES.ORGANIZER) return;

  if (key === 'events') {
    if (!user.organizer) throw new ApiError(403, 'У вашого акаунта немає профілю організатора.');
    raw.organizer = user.organizer.id;
  }

  if (key === 'tickets' && raw.event !== undefined) {
    const event = await eventById(raw.event);
    if (!event || event.organizer?.id !== user.organizer?.id) {
      throw new ApiError(403, 'Оберіть подію, якою ви керуєте.');
    }
  }
}
