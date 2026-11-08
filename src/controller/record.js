import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';
import { navigation } from '../view/navigation.js';
import { getDependents } from '../service/relations.js';

function parsedId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function relatedInfo() {
  return async (req, res) => {
    const config = formConfig[req.params.resource];
    const id = parsedId(req.params.id);

    if (!config) return res.status(404).json({ message: 'Ресурс не знайдено.' });
    if (!id) return res.status(400).json({ message: 'Некоректний ідентифікатор запису.' });

    res.json(await getDependents(req.params.resource, id));
  };
}

export function deleteRecord(key) {
  return async (req, res) => {
    const id = parsedId(req.params.id);
    if (!id) return res.redirect(`/${key}?error=invalidId`);

    const dependents = await getDependents(key, id);
    if (dependents.total > 0) return res.redirect(`/${key}?error=related`);

    try {
      const result = await AppDataSource.getRepository(formConfig[key].entity).delete(id);
      if (!result.affected) return res.redirect(`/${key}?error=notFound`);
      return res.redirect(`/${key}?notice=deleted`);
    } catch {
      return res.redirect(`/${key}?error=dbDelete`);
    }
  };
}
