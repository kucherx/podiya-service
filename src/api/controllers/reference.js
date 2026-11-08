import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
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
