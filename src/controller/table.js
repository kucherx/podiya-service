import { AppDataSource } from '../db/data-source.js';
import { tableConfig } from '../view/table-config.js';
import { navigation } from '../view/navigation.js';
import { messageFromQuery } from '../lib/messages.js';

export function listTable(key) {
  return async (req, res) => {
    const config = tableConfig[key];
    const records = await AppDataSource.getRepository(config.entity).find({
      relations: config.relations || {},
      order: config.order
    });

    res.render('table', {
      title: config.title,
      active: key,
      nav: navigation,
      columns: config.columns,
      align: config.columns.map((_, index) => (config.center || []).includes(index) ? 'center' : ''),
      widths: (config.widths || []).map((width) => `${(Number.parseFloat(width) * 0.82).toFixed(1)}%`),
      colspan: config.columns.length + 1,
      key,
      items: records.map((record) => ({
        id: record.id,
        cells: config.row(record),
        name: config.label(record),
        editHref: `/${key}/${record.id}/edit`
      })),
      createHref: `/${key}/new`,
      message: messageFromQuery(req.query)
    });
  };
}
