import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { formConfig } from '../../view/forms/index.js';
import { validate } from '../../validation/validate.js';
import { mapDbError } from '../../validation/db-errors.js';
import { getResource } from '../resources.js';
import { canWriteRecord } from '../access.js';
import {
  ApiError,
  jsonError,
  normalizeBody,
  parseId,
  recordToRaw,
  validationError
} from '../helpers.js';
import { applyUpdateRules } from '../rules.js';

export async function update(req, res) {
  const resource = getResource(req.params.resource);
  if (!resource) return jsonError(res, 404, 'Ресурс не знайдено.');

  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Запис не знайдено.');

  const repository = AppDataSource.getRepository(resource.entity);
  const record = await repository.findOne({
    where: { id },
    relations: resource.relations
  });
  if (!record) return jsonError(res, 404, 'Запис не знайдено.');

  const role = req.user?.role || ROLES.GUEST;
  if (!canWriteRecord(role, resource.key, record, req.user, 'update')) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }

  const config = formConfig[resource.key];
  const body = normalizeBody(resource.key, req.body);
  const raw = req.method === 'PATCH'
    ? { ...recordToRaw(resource.key, record), ...body }
    : body;

  try {
    await applyUpdateRules(role, resource.key, raw, req.user);
    const { errors, data } = await validate(config, raw, id);
    if (Object.keys(errors).length) return validationError(res, errors);

    repository.merge(record, data);
    await repository.save(record);
    const updated = await repository.findOne({
      where: { id },
      relations: resource.relations
    });
    return res.json(updated);
  } catch (error) {
    if (error instanceof ApiError) return jsonError(res, error.status, error.message, error.field);
    return res.status(422).json({
      message: 'Не вдалося оновити запис.',
      errors: mapDbError(error, config)
    });
  }
}
