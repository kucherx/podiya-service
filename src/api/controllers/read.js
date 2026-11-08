import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { getResource } from '../resources.js';
import { applyListQuery, jsonError, parseId } from '../helpers.js';
import { canReadRecord, readScope } from '../access.js';

function roleOf(req) {
  return req.user?.role || ROLES.GUEST;
}

export async function list(req, res) {
  const resource = getResource(req.params.resource);
  if (!resource) return jsonError(res, 404, 'Ресурс не знайдено.');

  const where = readScope(roleOf(req), resource.key, req.user);
  if (!where) return jsonError(res, 403, 'Доступ заборонено.');

  const query = { where, relations: resource.relations, order: resource.order };
  applyListQuery(query, req, resource);
  const rows = await AppDataSource.getRepository(resource.entity).find(query);
  return res.json(rows);
}

export async function read(req, res) {
  const resource = getResource(req.params.resource);
  if (!resource) return jsonError(res, 404, 'Ресурс не знайдено.');

  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Запис не знайдено.');

  const row = await AppDataSource.getRepository(resource.entity).findOne({
    where: { id },
    relations: resource.relations
  });
  if (!row) return jsonError(res, 404, 'Запис не знайдено.');
  if (!canReadRecord(roleOf(req), resource.key, row, req.user)) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }
  return res.json(row);
}
