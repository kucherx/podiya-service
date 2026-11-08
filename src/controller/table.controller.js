import { AppDataSource } from '../db/data-source.js';
import { tableConfig } from '../view/table-config.js';
import { navigation } from '../view/navigation.js';

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
      widths: config.widths || [],
      rows: records.map(config.row)
    });
  };
}
