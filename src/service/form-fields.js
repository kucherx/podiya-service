import { AppDataSource } from '../db/data-source.js';
import { formatDateDisplay, formatInputDateTime } from '../view/format.js';

function relationNames(config) {
  return Object.fromEntries(
    config.fields.filter((field) => field.relation).map((field) => [field.name, true])
  );
}

function rawValue(field, record, values) {
  if (values) {
    const raw = values[field.name];
    if (field.type === 'multiselect') {
      if (Array.isArray(raw)) return raw;
      return raw ? [raw] : [];
    }
    return raw ?? '';
  }
  if (!record) {
    if (field.default !== undefined) return String(field.default);
    return field.type === 'multiselect' ? [] : '';
  }
  if (field.type === 'multiselect') return (record[field.name] || []).map((item) => item.id);
  if (field.relation) return record[field.name]?.id ?? '';
  if (field.type === 'datetime') return formatInputDateTime(record[field.name]);
  return record[field.name] ?? '';
}

async function loadOptions(field, value) {
  const selected = field.type === 'multiselect'
    ? (Array.isArray(value) ? value.map(String) : [])
    : [String(value)];

  if (!field.relation) {
    return (field.options || []).map((option) => ({
      ...option,
      selected: selected.includes(String(option.value))
    }));
  }

  const rows = await AppDataSource.getRepository(field.relation.entity).find({
    relations: field.relation.include || {},
    order: field.relation.order
  });

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

export async function loadRecord(config, id) {
  return AppDataSource.getRepository(config.entity).findOne({
    where: { id },
    relations: relationNames(config)
  });
}

export async function buildFields(config, record, values, errors) {
  const fields = [];

  for (const field of config.fields) {
    const value = rawValue(field, record, values);
    fields.push({
      ...field,
      value: Array.isArray(value) ? '' : String(value),
      display: field.type === 'datetime' ? formatDateDisplay(value) : '',
      inputType: ['email', 'tel', 'url', 'number'].includes(field.type) ? field.type : 'text',
      prompt: field.placeholder || 'Оберіть значення',
      options: await loadOptions(field, value),
      error: errors?.[field.name] || ''
    });
  }

  return fields;
}
