import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';
import { getDependents } from '../service/relations.js';
import { canAccessRecord, canManageResource } from '../auth/access.js';
import { ROLES } from '../auth/roles.js';
import { navigationFor } from '../view/navigation.js';
import { wantsJson } from '../lib/request.js';

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

export function deleteRecord(key) {
  return async (req, res) => {
    const id = parsedId(req.params.id);
    if (!id) {
      if (wantsJson(req)) return res.status(400).json({ ok: false, message: 'Некоректний ідентифікатор запису.' });
      return res.redirect(`/${key}?error=invalidId`);
    }

    if (!canManageResource(req.user.role, key)) {
      if (wantsJson(req)) return res.status(403).json({ ok: false, message: 'Доступ заборонено.' });
      return res.status(403).render('error', {
        title: 'Доступ заборонено',
        message: 'У вас немає прав для цієї дії.',
        active: null,
        nav: navigationFor(req.user.role)
      });
    }

    if (req.user.role === ROLES.ORGANIZER && !(await canAccessRecord(req.user.role, key, id, req.user))) {
      if (wantsJson(req)) return res.status(403).json({ ok: false, message: 'Доступ заборонено.' });
      return res.status(403).render('error', {
        title: 'Доступ заборонено',
        message: 'У вас немає прав для цієї дії.',
        active: null,
        nav: navigationFor(req.user.role)
      });
    }

    const dependents = await getDependents(key, id);
    if (dependents.total > 0) {
      if (wantsJson(req)) {
        return res.status(409).json({
          ok: false,
          message: 'Не можна видалити запис, поки з ним пов’язані інші записи.',
          items: dependents.items
        });
      }
      return res.redirect(`/${key}?error=related`);
    }

    try {
      const result = await AppDataSource.getRepository(formConfig[key].entity).delete(id);
      if (!result.affected) {
        if (wantsJson(req)) return res.status(404).json({ ok: false, message: 'Запис не знайдено.' });
        return res.redirect(`/${key}?error=notFound`);
      }
      if (wantsJson(req)) return res.json({ ok: true, redirect: `/${key}?notice=deleted` });
      return res.redirect(`/${key}?notice=deleted`);
    } catch {
      if (wantsJson(req)) return res.status(500).json({ ok: false, message: 'Не вдалося видалити запис.' });
      return res.redirect(`/${key}?error=dbDelete`);
    }
  };
}
