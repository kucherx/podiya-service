export const resources = {
  events: {
    key: 'events',
    entity: 'Event',
    relations: { location: true, organizer: true, categories: true },
    order: { startsAt: 'ASC' },
    filters: ['status', 'organizer', 'location', 'category'],
    filterRelations: { category: 'categories' },
    search: ['title']
  },
  locations: {
    key: 'locations',
    entity: 'Location',
    relations: {},
    order: { city: 'ASC', name: 'ASC' },
    filters: ['city'],
    search: ['name', 'city']
  },
  organizers: {
    key: 'organizers',
    entity: 'Organizer',
    relations: {},
    order: { name: 'ASC' },
    filters: ['city'],
    search: ['name', 'city']
  },
  categories: {
    key: 'categories',
    entity: 'TicketCategory',
    relations: { events: true },
    order: { name: 'ASC' },
    filters: [],
    search: ['name']
  },
  tickets: {
    key: 'tickets',
    entity: 'Ticket',
    relations: { event: { organizer: true }, category: true, client: true },
    order: { code: 'ASC' },
    filters: ['status', 'event', 'category', 'client'],
    search: ['code']
  },
  clients: {
    key: 'clients',
    entity: 'Client',
    relations: {},
    order: { fullName: 'ASC' },
    filters: ['city'],
    search: ['fullName', 'email']
  }
};

export function getResource(key) {
  return resources[key] || null;
}
