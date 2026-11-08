import { AppDataSource } from '../db/data-source.js';

export async function loadOptions(field, value, user) {
  const selected = field.type === 'multiselect'
    ? (Array.isArray(value) ? value.map(String) : [])
    : [String(value)];

  if (!field.relation) {
    return (field.options || []).map((option) => ({
      ...option,
      selected: selected.includes(String(option.value))
    }));
  }

  let rows = await AppDataSource.getRepository(field.relation.entity).find({
    relations: field.relation.include || {},
    order: field.relation.order
  });

  if (field.relation.owner === 'organizer' && user?.organizer) {
    rows = rows.filter((row) => row.organizer?.id === user.organizer.id);
  }

  return rows.map((row) => {
    const label = typeof field.relation.label === 'function'
      ? field.relation.label(row)
      : row[field.relation.label];
    return {
      value: String(row.id),
      label,
      selected: selected.includes(String(row.id)),
      dataEvents: field.dependsOn ? (row.events || []).map((event) => event.id).join(',') : ''
    };
  });
}

export function buildFieldDefinitions(config) {
  return config.fields.map((field) => {
    const defaultValue = field.default !== undefined ? String(field.default) : '';
    return {
      ...field,
      value: field.type === 'multiselect' ? '' : defaultValue,
      display: '',
      inputType: ['email', 'tel', 'url', 'number'].includes(field.type) ? field.type : 'text',
      prompt: field.placeholder || 'Оберіть значення',
      options: field.relation
        ? []
        : (field.options || []).map((option) => ({
          ...option,
          selected: String(option.value) === defaultValue
        })),
      error: ''
    };
  });
}
