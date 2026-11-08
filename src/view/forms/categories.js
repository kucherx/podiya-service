export const categories = {
  entity: 'TicketCategory',
  title: 'Категорії квитків',
  singular: 'категорію',
  label: (item) => item.name,
  fields: [
    { name: 'name', label: 'Назва', type: 'text', required: true, unique: true, uniqueMessage: 'Категорія з такою назвою вже існує.', minLength: 2, maxLength: 120, placeholder: 'Наприклад: Стандарт' },
    { name: 'price', label: 'Ціна, ₴', type: 'number', required: true, min: 0, step: 0.01, placeholder: '450' },
    { name: 'quantity', label: 'Кількість', type: 'number', required: true, integer: true, min: 0, max: 100000, step: 1, placeholder: '100' },
    { name: 'description', label: 'Опис', type: 'textarea', maxLength: 1000, rows: 3, wide: true, placeholder: 'Умови категорії' }
  ],
  dependents: [
    { entity: 'Event', field: 'categories', label: 'події', many: true },
    { entity: 'Ticket', field: 'category', label: 'квитки' }
  ]
};
