import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { getDependents } from '../../service/relations.js';
import { getResource } from '../resources.js';
import { canWriteRecord } from '../access.js';
import { jsonError, parseId } from '../helpers.js';

export async function remove(req, res) {
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
  if (!canWriteRecord(role, resource.key, record, req.user, 'delete')) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }

  const related = await getDependents(resource.key, id);
  if (related?.total > 0) {
    return res.status(409).json({
      message: 'Не можна видалити запис, поки з ним пов’язані інші записи.',
      related: related.items
    });
  }

  await repository.delete(id);
  return res.status(204).end();
}
