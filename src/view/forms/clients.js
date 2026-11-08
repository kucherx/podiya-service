export const clients = {
  entity: 'Client',
  title: 'Клієнти',
  singular: 'клієнта',
  label: (item) => item.fullName,
  fields: [
    { name: 'fullName', label: 'ПІБ', type: 'text', required: true, minLength: 3, maxLength: 160, wide: true, placeholder: 'Прізвище Ім’я По батькові' },
    { name: 'email', label: 'Email', type: 'email', required: true, unique: true, maxLength: 160, placeholder: 'client@example.com' },
    { name: 'phone', label: 'Телефон', type: 'tel', required: true, maxLength: 32, pattern: /^[+0-9()\s-]{7,32}$/, placeholder: '+380 67 123 45 67' },
    { name: 'city', label: 'Місто', type: 'text', required: true, minLength: 2, maxLength: 100, placeholder: 'Львів' }
  ],
  dependents: [
    { entity: 'Ticket', field: 'client', label: 'квитки' }
  ]
};
