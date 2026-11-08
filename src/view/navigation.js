import { ROLES } from '../auth/roles.js';

const items = [
  { key: 'events', label: 'Події', href: '/events' },
  { key: 'locations', label: 'Локації', href: '/locations' },
  { key: 'organizers', label: 'Організатори', href: '/organizers' },
  { key: 'categories', label: 'Категорії квитків', href: '/categories' },
  { key: 'tickets', label: 'Квитки', href: '/tickets' },
  { key: 'clients', label: 'Клієнти', href: '/clients' }
];

export const navigation = items;

export function navigationFor(role) {
  if (role === ROLES.ADMIN) return items;

  if (role === ROLES.ORGANIZER) {
    return [
      { key: 'events', label: 'Мої події', href: '/events' },
      { key: 'tickets', label: 'Квитки', href: '/tickets' }
    ];
  }

  if (role === ROLES.CLIENT) {
    return [
      { key: 'events', label: 'Події', href: '/events' },
      { key: 'tickets', label: 'Мої квитки', href: '/tickets' }
    ];
  }

  return [{ key: 'events', label: 'Події', href: '/events' }];
}
