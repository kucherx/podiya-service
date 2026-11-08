import { formConfig } from '../view/forms/index.js';
import { getDependents } from '../service/relations.js';
import { canAccessRecord } from '../auth/access.js';
import { ROLES } from '../auth/roles.js';

function parsedId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function relatedInfo() {
  return async (req, res) => {
    const resource = req.params.resource;
    const config = formConfig[resource];
    const id = parsedId(req.params.id);

    if (!config) return res.status(404).json({ message: 'Ресурс не знайдено.' });
    if (!id) return res.status(400).json({ message: 'Некоректний ідентифікатор запису.' });

    if (req.user.role !== ROLES.ADMIN) {
      const allowed = await canAccessRecord(req.user.role, resource, id, req.user);
      if (!allowed) return res.status(403).json({ message: 'Доступ заборонено.' });
    }

    res.json(await getDependents(resource, id));
  };
}
