import { ROLES } from '../auth/roles.js';

export function readScope(role, key, user) {
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
  }
  return null;
}

export function canCreate(role, key) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.ORGANIZER) return key === 'events' || key === 'tickets';
  if (role === ROLES.CLIENT) return key === 'tickets';
  return false;
}

export function canReadRecord(role, key, record, user) {
  if (role === ROLES.ADMIN) return true;
  if (key === 'events') {
    if (role === ROLES.ORGANIZER) return record.organizer?.id === user?.organizer?.id;
    return record.status === 'published';
  }
  if (key === 'tickets') {
    if (role === ROLES.ORGANIZER) return record.event?.organizer?.id === user?.organizer?.id;
    if (role === ROLES.CLIENT) return record.client?.id === user?.client?.id;
  }
  return false;
}

export function canWriteRecord(role, key, record, user, mode) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.ORGANIZER) {
    if (key === 'events') return record.organizer?.id === user?.organizer?.id;
    if (key === 'tickets') return record.event?.organizer?.id === user?.organizer?.id;
  }
  if (role === ROLES.CLIENT && key === 'tickets' && mode === 'delete') {
    return record.client?.id === user?.client?.id && record.status === 'reserved';
  }
  return false;
}
