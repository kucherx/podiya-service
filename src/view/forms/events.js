import { eventStatusOptions } from '../format.js';

export const events = {
  entity: 'Event',
  title: 'Події',
  singular: 'подію',
  label: (item) => item.title,
  fields: [
    { name: 'title', label: 'Назва', type: 'text', required: true, minLength: 3, maxLength: 200, wide: true, placeholder: 'Наприклад: Ніч електронної музики' },
    {
      name: 'location',
      label: 'Локація',
      type: 'select',
      required: true,
      placeholder: 'Оберіть локацію',
      relation: { entity: 'Location', label: 'name', order: { name: 'ASC' } }
    },
    {
      name: 'organizer',
      label: 'Організатор',
      type: 'select',
      required: true,
      placeholder: 'Оберіть організатора',
      relation: { entity: 'Organizer', label: 'name', order: { name: 'ASC' } }
    },
    {
      name: 'categories',
      label: 'Категорії квитків',
      type: 'multiselect',
      required: true,
      wide: true,
      relation: { entity: 'TicketCategory', label: 'name', order: { name: 'ASC' } }
    },
    { name: 'startsAt', label: 'Початок', type: 'datetime', required: true },
    { name: 'endsAt', label: 'Завершення', type: 'datetime', required: true },
    { name: 'status', label: 'Статус', type: 'select', required: true, options: eventStatusOptions, default: 'draft', placeholder: 'Оберіть статус' },
    { name: 'description', label: 'Опис', type: 'textarea', required: true, minLength: 10, maxLength: 2000, rows: 4, wide: true, placeholder: 'Короткий опис події' }
  ],
  dependents: [
    { entity: 'Ticket', field: 'event', label: 'квитки' }
  ],
  after: (data, errors) => {
    if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
      errors.endsAt = 'Завершення має бути пізніше за початок.';
    }
  }
};
