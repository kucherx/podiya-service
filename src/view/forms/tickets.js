import { ticketStatusOptions } from '../format.js';

export const tickets = {
  entity: 'Ticket',
  title: 'Квитки',
  singular: 'квиток',
  label: (item) => item.code,
  fields: [
    {
      name: 'event',
      label: 'Подія',
      type: 'select',
      required: true,
      placeholder: 'Оберіть подію',
      relation: { entity: 'Event', label: 'title', order: { startsAt: 'ASC' }, include: { organizer: true }, owner: 'organizer' }
    },
    {
      name: 'category',
      label: 'Категорія',
      type: 'select',
      required: true,
      dependsOn: 'event',
      placeholder: 'Оберіть категорію',
      relation: {
        entity: 'TicketCategory',
        include: { events: true },
        label: 'name',
        order: { name: 'ASC' }
      }
    },
    {
      name: 'client',
      label: 'Клієнт',
      type: 'select',
      placeholder: 'Без клієнта',
      relation: { entity: 'Client', label: 'fullName', order: { fullName: 'ASC' } }
    },
    { name: 'status', label: 'Статус', type: 'select', required: true, options: ticketStatusOptions, default: 'available', placeholder: 'Оберіть статус' },
    { name: 'price', label: 'Ціна, ₴', type: 'number', required: true, min: 0, step: 0.01, placeholder: '450' },
    { name: 'purchasedAt', label: 'Дата продажу', type: 'datetime' }
  ],
  dependents: [],
  after: (data, errors) => {
    if (data.status === 'sold' && !data.purchasedAt) {
      errors.purchasedAt = 'Для проданого квитка вкажіть дату продажу.';
    }
  }
};
