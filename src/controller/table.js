import { AppDataSource } from '../db/data-source.js';
import { tableConfig } from '../view/table-config.js';
import { navigationFor } from '../view/navigation.js';
import { messageFromQuery } from '../lib/messages.js';
import { ROLES } from '../auth/roles.js';
import { canManageResource, canViewResource, scopeWhere } from '../auth/access.js';
import { renderError } from '../lib/render-error.js';

export function listTable(key) {
  return async (req, res) => {
    const role = req.user?.role || ROLES.GUEST;
    const where = scopeWhere(role, key, req.user);
    const config = tableConfig[key];

    if (!canViewResource(role, key) || where === null) {
      return renderError(req, res, 403, 'Доступ заборонено', 'У вас немає прав для перегляду цієї сторінки.');
    }

    const records = await AppDataSource.getRepository(config.entity).find({
      where,
      relations: config.relations || {},
      order: config.order
    });
    const canManage = canManageResource(role, key);
    const hideId = role === ROLES.CLIENT || role === ROLES.GUEST;
    const start = hideId ? 1 : 0;
    const hasDetail = key === 'events' || key === 'tickets';
    const columns = config.columns.slice(start);
    const centers = (config.center || [])
      .filter((index) => index >= start)
      .map((index) => index - start);
    const baseWidths = (config.widths || []).slice(start).map((width) => Number.parseFloat(width));
    const totalWidth = baseWidths.reduce((sum, width) => sum + width, 0) || 100;
    const extraWidth = (hasDetail ? 10 : 0) + (canManage ? 18 : 0);
    const scale = (100 - extraWidth) / totalWidth;

    res.render('table', {
      title: config.title,
      active: key,
      nav: navigationFor(role),
      columns,
      align: columns.map((_, index) => centers.includes(index) ? 'center' : ''),
      widths: baseWidths.map((width) => `${(width * scale).toFixed(1)}%`),
      colspan: columns.length + (hasDetail ? 1 : 0) + (canManage ? 1 : 0),
      key,
      canManage,
      hasDetail,
      items: records.map((record) => ({
        id: record.id,
        cells: config.row(record).slice(start),
        name: config.label(record),
        editHref: `/${key}/${record.id}/edit`,
        detailHref: key === 'tickets'
          ? `/events/${record.event?.id}?ticket=${record.id}`
          : `/${key}/${record.id}`
      })),
      createHref: `/${key}/new`,
      message: messageFromQuery(req.query)
    });
  };
}
