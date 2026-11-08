import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { formConfig } from '../../view/forms/index.js';
import { configForUser } from '../../service/form-config.js';
import { loadOptions } from '../../service/form-fields.js';
import { jsonError } from '../helpers.js';

export async function eventFormReference(req, res) {
  if (![ROLES.ADMIN, ROLES.ORGANIZER].includes(req.user?.role)) {
    return jsonError(res, 403, 'Доступ заборонено.');
  }

  const [locations, categories, organizers] = await Promise.all([
    AppDataSource.getRepository('Location').find({ order: { name: 'ASC' } }),
    AppDataSource.getRepository('TicketCategory').find({ order: { name: 'ASC' } }),
    req.user.role === ROLES.ADMIN
      ? AppDataSource.getRepository('Organizer').find({ order: { name: 'ASC' } })
      : Promise.resolve(req.user.organizer ? [req.user.organizer] : [])
  ]);

  return res.json({ locations, categories, organizers });
}

function option(item) {
  return { id: item.id, label: item.name || item.title || item.fullName || item.label || `#${item.id}` };
}

export async function formReference(req, res) {
  const key = req.params.resource;
  const role = req.user?.role;

  if (!role) return jsonError(res, 401, 'Потрібна авторизація.');

  if (key === 'users') {
    if (role !== ROLES.ADMIN) return jsonError(res, 403, 'Доступ заборонено.');
    const [organizers, clients] = await Promise.all([
      AppDataSource.getRepository('Organizer').find({ order: { name: 'ASC' } }),
      AppDataSource.getRepository('Client').find({ order: { fullName: 'ASC' } })
    ]);
    return res.json({
      organizerId: organizers.map(option),
      clientId: clients.map(option)
    });
  }

  if (!formConfig[key]) return jsonError(res, 404, 'Ресурс не знайдено.');
  if (![ROLES.ADMIN, ROLES.ORGANIZER].includes(role)) return jsonError(res, 403, 'Доступ заборонено.');

  const config = configForUser(formConfig[key], req.user);
  const result = {};

  for (const field of config.fields.filter((item) => item.relation)) {
    const options = await loadOptions(field, '', req.user);
    result[field.name] = options.map((item) => ({
      id: Number(item.value),
      label: item.label,
      dataEvents: item.dataEvents
    }));
  }

  return res.json(result);
}
