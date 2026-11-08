import { formatDate, formatMoney, formatStatus } from './format.js';

export const tableConfig = {
  events: {
    entity: 'Event',
    title: 'Події',
    label: (event) => event.title,
    columns: ['ID', 'Назва', 'Локація', 'Організатор', 'Початок', 'Категорії', 'Статус'],
    center: [0, 4, 6],
    widths: ['5%', '24%', '17%', '18%', '12%', '14%', '10%'],
    relations: { location: true, organizer: true, categories: true },
    order: { startsAt: 'ASC' },
    row: (event) => [
      event.id,
      event.title,
      event.location?.name || '',
      event.organizer?.name || '',
      formatDate(event.startsAt),
      (event.categories || []).map((category) => category.name).join(', '),
      formatStatus(event.status)
    ]
  },
  locations: {
    entity: 'Location',
    title: 'Локації',
    label: (location) => location.name,
    columns: ['ID', 'Назва', 'Місто', 'Адреса', 'Місткість'],
    center: [0, 4],
    widths: ['6%', '26%', '18%', '40%', '10%'],
    order: { name: 'ASC' },
    row: (location) => [
      location.id,
      location.name,
      location.city,
      location.address,
      location.capacity
    ]
  },
  organizers: {
    entity: 'Organizer',
    title: 'Організатори',
    label: (organizer) => organizer.name,
    columns: ['ID', 'Назва', 'Місто', 'Email', 'Телефон', 'Сайт'],
    center: [0, 4],
    widths: ['5%', '24%', '16%', '24%', '15%', '16%'],
    order: { name: 'ASC' },
    row: (organizer) => [
      organizer.id,
      organizer.name,
      organizer.city,
      organizer.email,
      organizer.phone,
      organizer.website || ''
    ]
  },
  categories: {
    entity: 'TicketCategory',
    title: 'Категорії квитків',
    label: (category) => category.name,
    columns: ['ID', 'Назва', 'Ціна', 'Кількість', 'Подій'],
    center: [0, 2, 3, 4],
    widths: ['7%', '35%', '18%', '16%', '24%'],
    relations: { events: true },
    order: { name: 'ASC' },
    row: (category) => [
      category.id,
      category.name,
      formatMoney(category.price),
      category.quantity,
      category.events?.length || 0
    ]
  },
  tickets: {
    entity: 'Ticket',
    title: 'Квитки',
    label: (ticket) => ticket.code,
    columns: ['ID', 'Код', 'Подія', 'Категорія', 'Клієнт', 'К-сть', 'Статус', 'Сума'],
    center: [0, 1, 5, 6, 7],
    widths: ['5%', '11%', '24%', '13%', '15%', '7%', '12%', '13%'],
    relations: { event: true, category: true, client: true },
    order: { code: 'ASC' },
    row: (ticket) => [
      ticket.id,
      ticket.code,
      ticket.event?.title || '',
      ticket.category?.name || '',
      ticket.client?.fullName || '',
      ticket.quantity || 1,
      formatStatus(ticket.status),
      formatMoney(Number(ticket.price || 0) * Number(ticket.quantity || 1))
    ]
  },
  clients: {
    entity: 'Client',
    title: 'Клієнти',
    label: (client) => client.fullName,
    columns: ['ID', 'ПІБ', 'Email', 'Телефон', 'Місто'],
    center: [0, 3],
    widths: ['6%', '24%', '30%', '15%', '25%'],
    order: { fullName: 'ASC' },
    row: (client) => [
      client.id,
      client.fullName,
      client.email,
      client.phone,
      client.city
    ]
  }
};
