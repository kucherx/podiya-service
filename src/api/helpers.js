import { Like } from 'typeorm';
import { formatInputDateTime } from '../view/format.js';
import { formConfig } from '../view/forms/index.js';

export class ApiError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export function jsonError(res, status, message, field) {
  const body = { message };
  if (field) body.field = field;
  return res.status(status).json(body);
}

export function validationError(res, errors) {
  return res.status(422).json({ message: 'Помилка валідації.', errors });
}

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function inputDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatInputDateTime(date);
}

export function normalizeBody(key, body = {}) {
  const config = formConfig[key];
  const raw = {};
  for (const field of config.fields) {
    if (!(field.name in body)) continue;
    let value = body[field.name];
    if (field.type === 'datetime' && value) value = inputDate(value);
    if (field.type === 'select' && field.relation && value && typeof value === 'object') value = value.id;
    if (field.type === 'multiselect' && Array.isArray(value)) {
      value = value.map((item) => (item && typeof item === 'object' ? item.id : item));
    }
    raw[field.name] = value;
  }
  return raw;
}

export function recordToRaw(key, record) {
  const config = formConfig[key];
  const raw = {};
  for (const field of config.fields) {
    const value = record[field.name];
    if (field.type === 'select' && field.relation) raw[field.name] = value?.id ?? '';
    else if (field.type === 'multiselect') raw[field.name] = (value || []).map((item) => item.id);
    else if (field.type === 'datetime') raw[field.name] = value ? inputDate(value) : '';
    else raw[field.name] = value ?? '';
  }
  return raw;
}

export function applyListQuery(query, req, resource) {
  const limit = Number(req.query.limit);
  if (Number.isInteger(limit) && limit > 0) query.take = Math.min(limit, 100);
  const offset = Number(req.query.offset);
  if (Number.isInteger(offset) && offset >= 0) query.skip = offset;

  for (const name of ['status', 'city']) {
    if (resource.filters.includes(name) && req.query[name] && query.where[name] === undefined) {
      query.where[name] = String(req.query[name]);
    }
  }

  for (const name of ['event', 'category', 'client', 'organizer', 'location']) {
    const relation = resource.filterRelations?.[name] || name;
    if (resource.filters.includes(name) && req.query[name] && query.where[relation] === undefined) {
      const id = parseId(req.query[name]);
      if (id) query.where[relation] = { id };
    }
  }

  if (req.query.q && resource.search.length) {
    const term = `%${String(req.query.q).trim()}%`;
    query.where = resource.search.map((field) => ({ ...query.where, [field]: Like(term) }));
  }
}
