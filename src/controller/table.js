import { AppDataSource } from '../db/data-source.js';
import { tableConfig } from '../view/table-config.js';
import { navigationFor } from '../view/navigation.js';
import { messageFromQuery } from '../lib/messages.js';
import { ROLES } from '../auth/roles.js';
import { canManageResource, canViewResource, scopeWhere } from '../auth/access.js';

export function listTable(key) {
  return async (req, res) => {
    const role = req.user?.role || ROLES.GUEST;
    const where = scopeWhere(role, key, req.user);
    const config = tableConfig[key];

    if (!canViewResource(role, key) || where === null) {
      return res.status(403).render('error', {
        title: 'Доступ заборонено',
        message: 'У вас немає прав для перегляду цієї сторінки.',
        active: null,
        nav: navigationFor(role)
      });
    }

    const records = await AppDataSource.getRepository(config.entity).find({
      where,
      relations: config.relations || {},
      order: config.order
    });
    const canManage = canManageResource(role, key);
    const hideId = role === ROLES.CLIENT || role === ROLES.GUEST;
    const start = hideId ? 1 : 0;
    const columns = config.columns.slice(start);
    const centers = (config.center || [])
      .filter((index) => index >= start)
      .map((index) => index - start);
    const baseWidths = (config.widths || []).slice(start).map((width) => Number.parseFloat(width));
    const totalWidth = baseWidths.reduce((sum, width) => sum + width, 0) || 100;
    const scale = (canManage ? 0.82 : 1) * (100 / totalWidth);

    res.render('table', {
      title: config.title,
      active: key,
      nav: navigationFor(role),
      columns,
      align: columns.map((_, index) => centers.includes(index) ? 'center' : ''),
      widths: baseWidths.map((width) => `${(width * scale).toFixed(1)}%`),
      colspan: columns.length + (canManage ? 1 : 0),
      key,
      canManage,
      items: records.map((record) => ({
        id: record.id,
        cells: config.row(record).slice(start),
        name: config.label(record),
        editHref: `/${key}/${record.id}/edit`
      })),
      createHref: `/${key}/new`,
      message: messageFromQuery(req.query)
    });
  };
}
