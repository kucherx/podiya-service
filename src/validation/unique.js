import { Not } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';
import { isBlank } from './values.js';

function repository(config) {
  return AppDataSource.getRepository(config.entity);
}

export async function validateUnique(config, field, data, errors, id) {
  if (!field.unique || isBlank(data[field.name]) || errors[field.name]) return;
  const where = { [field.name]: data[field.name] };
  if (id) where.id = Not(id);
  if (await repository(config).count({ where })) {
    errors[field.name] = field.uniqueMessage || (field.type === 'email'
      ? 'Така email-адреса вже використовується.'
      : 'Таке значення вже використовується.');
  }
}

export async function validateGroups(config, data, errors, id) {
  for (const group of config.uniqueGroups || []) {
    if (group.fields.some((name) => isBlank(data[name]) || errors[name])) continue;
    const where = {};
    for (const name of group.fields) where[name] = data[name];
    if (id) where.id = Not(id);
    if (await repository(config).count({ where })) {
      errors[group.fields[group.fields.length - 1]] = group.message;
    }
  }
}
