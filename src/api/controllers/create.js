import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { formConfig } from '../../view/forms/index.js';
import { validate } from '../../validation/validate.js';
import { mapDbError } from '../../validation/db-errors.js';
import { nextTicketCode } from '../../service/ticket-code.js';
import { getResource } from '../resources.js';
import { canCreate } from '../access.js';
import { ApiError, jsonError, normalizeBody, validationError } from '../helpers.js';
import { applyCreateRules } from '../rules.js';

export async function create(req, res) {
  const resource = getResource(req.params.resource);
  if (!resource) return jsonError(res, 404, 'Ресурс не знайдено.');

  const role = req.user?.role || ROLES.GUEST;
  if (!canCreate(role, resource.key)) return jsonError(res, 403, 'Доступ заборонено.');

  const config = formConfig[resource.key];
  try {
    const raw = normalizeBody(resource.key, req.body);
    await applyCreateRules(role, resource.key, raw, req.user);
    const { errors, data } = await validate(config, raw, null);
    if (Object.keys(errors).length) return validationError(res, errors);

    if (resource.key === 'tickets') {
      data.code = await nextTicketCode(data.event.id, data.category.id);
    }

    const repository = AppDataSource.getRepository(resource.entity);
    const created = await repository.save(repository.create(data));
    const row = await repository.findOne({
      where: { id: created.id },
      relations: resource.relations
    });
    return res.status(201).json(row);
  } catch (error) {
    if (error instanceof ApiError) return jsonError(res, error.status, error.message, error.field);
    return res.status(422).json({
      message: 'Не вдалося створити запис.',
      errors: mapDbError(error, config)
    });
  }
}
