import { AppDataSource } from '../db/data-source.js';
import { ROLES } from './roles.js';

export function canViewResource(role, key) {
  if (role === ROLES.ADMIN) return true;
  if (key === 'events') return true;
  if (key === 'tickets') return role === ROLES.ORGANIZER || role === ROLES.CLIENT;
  return false;
}

export function canManageResource(role, key) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.ORGANIZER) return key === 'events' || key === 'tickets';
  return false;
}

export function scopeWhere(role, key, user) {
  if (role === ROLES.ADMIN) return {};
  if (key === 'events') {
    if (role === ROLES.ORGANIZER) {
      return user?.organizer ? { organizer: { id: user.organizer.id } } : { id: -1 };
    }
    return { status: 'published' };
  }
  if (key === 'tickets') {
    if (role === ROLES.ORGANIZER) {
      return user?.organizer ? { event: { organizer: { id: user.organizer.id } } } : { id: -1 };
    }
    if (role === ROLES.CLIENT) {
      return user?.client ? { client: { id: user.client.id } } : { id: -1 };
    }
    return { id: -1 };
  }
  return null;
}

export async function canAccessRecord(role, key, id, user) {
  if (role === ROLES.ADMIN) return true;
  if (role !== ROLES.ORGANIZER || !user?.organizer) return false;

  if (key === 'events') {
    const event = await AppDataSource.getRepository('Event').findOne({
      where: { id },
      relations: { organizer: true }
    });
    return event?.organizer?.id === user.organizer.id;
  }

  if (key === 'tickets') {
    const ticket = await AppDataSource.getRepository('Ticket').findOne({
      where: { id },
      relations: { event: { organizer: true } }
    });
    return ticket?.event?.organizer?.id === user.organizer.id;
  }

  return false;
}
