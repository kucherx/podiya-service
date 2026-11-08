import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';

export async function getDependents(key, id) {
  const config = formConfig[key];
  if (!config) return null;

  const items = [];
  for (const dependent of config.dependents || []) {
    const repository = AppDataSource.getRepository(dependent.entity);
    const count = dependent.many
      ? await repository
        .createQueryBuilder('item')
        .innerJoin(`item.${dependent.field}`, 'related', 'related.id = :id', { id })
        .getCount()
      : await repository.count({ where: { [dependent.field]: { id } } });
    if (count > 0) items.push({ label: dependent.label, count });
  }

  return {
    total: items.reduce((sum, item) => sum + item.count, 0),
    items
  };
}
