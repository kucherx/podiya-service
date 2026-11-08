import { AppDataSource } from '../db/data-source.js';
import { parseInputDateTime } from '../view/format.js';

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

export async function validateMulti(field, raw, data, errors) {
  const values = [...new Set((Array.isArray(raw) ? raw : [raw]).filter(Boolean).map(String))];
  if (!values.length) {
    errors[field.name] = field.name === 'categories'
      ? 'Оберіть хоча б одну категорію.'
      : 'Оберіть хоча б одне значення.';
    return;
  }

  const ids = [];
  for (const value of values) {
    const id = Number(value);
    const related = Number.isInteger(id) && id > 0
      ? await AppDataSource.getRepository(field.relation.entity).findOneBy({ id })
      : null;
    if (!related) {
      errors[field.name] = 'Оберіть коректні значення зі списку.';
      return;
    }
    ids.push(id);
  }

  data[field.name] = ids.map((id) => ({ id }));
}

async function validateSelect(field, raw, data, errors) {
  const text = String(raw).trim();
  if (field.options) {
    if (field.options.some((option) => String(option.value) === text)) data[field.name] = text;
    else errors[field.name] = 'Оберіть значення зі списку.';
    return;
  }

  const id = Number(text);
  const related = Number.isInteger(id) && id > 0
    ? await AppDataSource.getRepository(field.relation.entity).findOne({
      where: { id },
      relations: field.relation.include || {}
    })
    : null;
  if (!related) {
    errors[field.name] = 'Оберіть значення зі списку.';
    return;
  }
  if (field.dependsOn && data[field.dependsOn]) {
    const linked = (related.events || []).some((event) => Number(event.id) === Number(data[field.dependsOn].id));
    if (!linked) {
      errors[field.name] = 'Оберіть категорію, доступну для цієї події.';
      return;
    }
  }
  data[field.name] = { id };
}

export async function validateValue(field, raw, data, errors) {
  const text = String(raw).trim();
  const quoted = `«${field.label}»`;

  if (field.type === 'number') {
    const value = Number(text.replace(',', '.'));
    if (!Number.isFinite(value)) errors[field.name] = 'Введіть коректне число.';
    else if (field.integer && !Number.isInteger(value)) errors[field.name] = 'Введіть ціле число.';
    else if (field.min !== undefined && value < field.min) errors[field.name] = `Значення не може бути меншим за ${field.min}.`;
    else if (field.max !== undefined && value > field.max) errors[field.name] = `Значення не може перевищувати ${field.max}.`;
    else data[field.name] = value;
    return;
  }

  if (field.type === 'datetime') {
    const value = parseInputDateTime(text);
    if (value) data[field.name] = value;
    else errors[field.name] = 'Введіть коректну дату й час.';
    return;
  }

  if (field.type === 'select') {
    await validateSelect(field, raw, data, errors);
    return;
  }

  if (field.type === 'tel') {
    const digits = text.replace(/\D/g, '');
    const valid = (digits.length === 10 && digits.startsWith('0'))
      || (digits.length === 12 && digits.startsWith('380'));
    if (!/^[+0-9()\s-]+$/.test(text) || !valid) {
      errors[field.name] = 'Введіть повний номер телефону: 10 цифр для місцевого або 12 для міжнародного.';
      return;
    }
  }

  if (field.minLength && text.length < field.minLength) {
    errors[field.name] = field.type === 'textarea'
      ? `Опис має містити щонайменше ${field.minLength} символів.`
      : `Поле ${quoted} має містити щонайменше ${field.minLength} символів.`;
    return;
  }
  if (field.maxLength && text.length > field.maxLength) {
    errors[field.name] = `Поле ${quoted} має містити не більше ${field.maxLength} символів.`;
    return;
  }
  if (field.type === 'email' && !emailPattern.test(text)) {
    errors[field.name] = 'Введіть коректну email-адресу латиницею.';
    return;
  }
  if (field.type === 'url') {
    try {
      const url = new URL(text);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
    } catch {
      errors[field.name] = 'Введіть коректну адресу сайту.';
      return;
    }
  }
  if (field.pattern && !field.pattern.test(text)) {
    errors[field.name] = 'Поле має неправильний формат.';
    return;
  }

  data[field.name] = field.type === 'email' ? text.toLowerCase() : text;
}
