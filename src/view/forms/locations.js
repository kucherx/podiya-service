export const locations = {
  entity: 'Location',
  title: 'Локації',
  singular: 'локацію',
  label: (item) => item.name,
  fields: [
    { name: 'name', label: 'Назва', type: 'text', required: true, minLength: 2, maxLength: 160, wide: true, placeholder: 'Наприклад: Простір «Арсенал»' },
    { name: 'city', label: 'Місто', type: 'text', required: true, minLength: 2, maxLength: 100, placeholder: 'Київ' },
    { name: 'capacity', label: 'Місткість', type: 'number', required: true, integer: true, min: 1, max: 100000, step: 1, placeholder: '500' },
    { name: 'address', label: 'Адреса', type: 'text', required: true, minLength: 5, maxLength: 255, wide: true, placeholder: 'Вулиця, будинок' }
  ],
  uniqueGroups: [
    { fields: ['city', 'name'], message: 'Локація з такою назвою вже існує в цьому місті.' }
  ],
  dependents: [
    { entity: 'Event', field: 'location', label: 'події' }
  ]
};
