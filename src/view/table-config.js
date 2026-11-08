import { formatDate, formatMoney, formatStatus } from './format.js';

export const tableConfig = {
  events: {
    entity: 'Event',
    title: 'Події',
    columns: ['ID', 'Назва', 'Локація', 'Організатор', 'Початок', 'Статус'],
    center: [0, 4, 5],
    widths: ['6%', '28%', '20%', '20%', '13%', '13%'],
    relations: { location: true, organizer: true },
    order: { startsAt: 'ASC' },
    row: (event) => [
      event.id,
      event.title,
      event.location?.name || '',
      event.organizer?.name || '',
      formatDate(event.startsAt),
      formatStatus(event.status)
    ]
  },
  locations: {
    entity: 'Location',
    title: 'Локації',
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
    columns: ['ID', 'Назва', 'Email', 'Телефон', 'Сайт'],
    center: [0, 3],
    widths: ['6%', '26%', '30%', '14%', '24%'],
    order: { name: 'ASC' },
    row: (organizer) => [
      organizer.id,
      organizer.name,
      organizer.email,
      organizer.phone,
      organizer.website || ''
    ]
  },
  categories: {
    entity: 'TicketCategory',
    title: 'Категорії квитків',
    columns: ['ID', 'Подія', 'Назва', 'Ціна', 'Кількість'],
    center: [0, 3, 4],
    widths: ['6%', '34%', '24%', '14%', '22%'],
    relations: { event: true },
    order: { name: 'ASC' },
    row: (category) => [
      category.id,
      category.event?.title || '',
      category.name,
      formatMoney(category.price),
      category.quantity
    ]
  },
  tickets: {
    entity: 'Ticket',
    title: 'Квитки',
    columns: ['ID', 'Код', 'Подія', 'Категорія', 'Клієнт', 'Статус', 'Ціна'],
    center: [0, 1, 5, 6],
    widths: ['5%', '12%', '27%', '14%', '16%', '14%', '12%'],
    relations: { event: true, category: true, client: true },
    order: { code: 'ASC' },
    row: (ticket) => [
      ticket.id,
      ticket.code,
      ticket.event?.title || '',
      ticket.category?.name || '',
      ticket.client?.fullName || '',
      formatStatus(ticket.status),
      formatMoney(ticket.price)
    ]
  },
  clients: {
    entity: 'Client',
    title: 'Клієнти',
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
