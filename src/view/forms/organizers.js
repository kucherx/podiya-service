export const organizers = {
  entity: 'Organizer',
  title: 'Організатори',
  singular: 'організатора',
  label: (item) => item.name,
  fields: [
    { name: 'name', label: 'Назва', type: 'text', required: true, minLength: 2, maxLength: 160, placeholder: 'Назва організації' },
    { name: 'city', label: 'Місто', type: 'text', required: true, minLength: 2, maxLength: 100, placeholder: 'Київ' },
    { name: 'email', label: 'Email', type: 'email', required: true, unique: true, maxLength: 160, placeholder: 'team@example.com' },
    { name: 'phone', label: 'Телефон', type: 'tel', required: true, maxLength: 32, placeholder: '+380 44 123 45 67' },
    { name: 'website', label: 'Сайт', type: 'url', maxLength: 255, placeholder: 'https://example.com' },
    { name: 'description', label: 'Опис', type: 'textarea', maxLength: 1000, rows: 4, wide: true, placeholder: 'Коротко про організатора' }
  ],
  uniqueGroups: [
    { fields: ['city', 'name'], message: 'Організатор з такою назвою вже існує в цьому місті.' }
  ],
  dependents: [
    { entity: 'Event', field: 'organizer', label: 'події' }
  ]
};
