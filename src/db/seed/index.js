import { locations } from './data/locations.js';
import { organizers } from './data/organizers.js';
import { clients } from './data/clients.js';
import { categories } from './data/categories.js';
import { events } from './data/events.js';

function ticketCode(eventIndex, categoryIndex, ticketIndex) {
  const eventPart = String(eventIndex + 1).padStart(2, '0');
  const categoryPart = String(categoryIndex + 1).padStart(2, '0');
  const ticketPart = String(ticketIndex + 1).padStart(2, '0');
  return `POD-${eventPart}-${categoryPart}-${ticketPart}`;
}

export async function seed(dataSource) {
  const locationRepo = dataSource.getRepository('Location');
  if (await locationRepo.count()) return false;

  const savedLocations = await locationRepo.save(locations);
  const savedOrganizers = await dataSource.getRepository('Organizer').save(organizers);
  const savedClients = await dataSource.getRepository('Client').save(clients);
  const categoryRepo = dataSource.getRepository('TicketCategory');
  const savedCategories = await categoryRepo.save(categories);
  const categoryByName = Object.fromEntries(savedCategories.map((category) => [category.name, category]));
  const eventRepo = dataSource.getRepository('Event');
  const ticketRepo = dataSource.getRepository('Ticket');

  for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
    const item = events[eventIndex];
    const event = await eventRepo.save({
      title: item.title,
      description: item.description,
      startsAt: new Date(item.startsAt),
      endsAt: new Date(item.endsAt),
      status: item.status,
      location: savedLocations[item.location],
      organizer: savedOrganizers[item.organizer],
      categories: item.categories.map((name) => categoryByName[name])
    });

    const tickets = [];
    for (let categoryIndex = 0; categoryIndex < item.categories.length; categoryIndex += 1) {
      const category = categoryByName[item.categories[categoryIndex]];
      for (let ticketIndex = 0; ticketIndex < 3; ticketIndex += 1) {
        const isSold = ticketIndex === 0;
        const isReserved = ticketIndex === 2;
        tickets.push({
          code: ticketCode(eventIndex, categoryIndex, ticketIndex),
          status: isSold ? 'sold' : isReserved ? 'reserved' : 'available',
          price: category.price,
          purchasedAt: isSold
            ? new Date(Date.UTC(2026, 10, 10 + eventIndex, 12, 0, 0))
            : null,
          event,
          category,
          client: isSold || isReserved
            ? savedClients[(eventIndex + categoryIndex) % savedClients.length]
            : null
        });
      }
    }

    await ticketRepo.save(tickets);
  }

  return true;
}
