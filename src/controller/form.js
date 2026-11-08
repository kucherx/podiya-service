import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';
import { navigationFor } from '../view/navigation.js';
import { buildFields, loadRecord } from '../service/form-fields.js';
import { validate } from '../validation/validate.js';
import { mapDbError } from '../validation/db-errors.js';
import { nextTicketCode } from '../service/ticket-code.js';
import { ROLES } from '../auth/roles.js';
import { canAccessRecord } from '../auth/access.js';
import { wantsJson } from '../lib/request.js';
import { renderError } from '../lib/render-error.js';

function parsedId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function configForUser(config, user) {
  if (user.role === ROLES.ORGANIZER && config.entity === 'Event') {
    return {
      ...config,
      fields: config.fields.filter((field) => field.name !== 'organizer')
    };
  }
  return config;
}

function renderForm(req, res, key, id, fields, errors, status = 200) {
  const full = formConfig[key];
  const config = configForUser(full, req.user);
  res.status(status).render('form', {
    title: id ? `Редагувати ${full.singular}` : `Створити ${full.singular}`,
    active: key,
    nav: navigationFor(req.user.role),
    config,
    isEdit: Boolean(id),
    fields,
    errors,
    action: id ? `/${key}/${id}` : `/${key}`,
    apiAction: id ? `/api/${key}/${id}` : `/api/${key}`,
    redirect: `/${key}`,
    cancelHref: `/${key}`,
    submitLabel: id ? 'Зберегти зміни' : 'Створити запис'
  });
}

function notFound(req, res, message = 'Запис не знайдено.') {
  return renderError(req, res, 404, 'Запис не знайдено', message);
}

function forbidden(req, res) {
  return renderError(req, res, 403, 'Доступ заборонено', 'У вас немає прав для цієї дії.');
}

export function showForm(key) {
  return async (req, res) => {
    const config = configForUser(formConfig[key], req.user);
    const id = req.params.id ? parsedId(req.params.id) : null;

    if (req.params.id && !id) return notFound(req, res, 'Некоректний ідентифікатор запису.');
    if (id && !(await canAccessRecord(req.user.role, key, id, req.user))) return forbidden(req, res);

    const record = id ? await loadRecord(config, id) : null;
    if (id && !record) return notFound(req, res);

    const fields = await buildFields(config, record, null, {}, req.user);
    renderForm(req, res, key, id, fields, {});
  };
}

export function saveForm(key) {
  return async (req, res) => {
    const full = formConfig[key];
    const config = configForUser(full, req.user);
    const id = req.params.id ? parsedId(req.params.id) : null;

    if (req.params.id && !id) return notFound(req, res, 'Некоректний ідентифікатор запису.');
    if (id && !(await canAccessRecord(req.user.role, key, id, req.user))) return forbidden(req, res);

    if (req.user.role === ROLES.ORGANIZER) {
      if (!req.user.organizer) return forbidden(req, res);
      if (key === 'events') req.body.organizer = String(req.user.organizer.id);
      if (key === 'tickets') {
        const eventId = Number(req.body.event);
        const event = await AppDataSource.getRepository('Event').findOne({
          where: { id: eventId },
          relations: { organizer: true }
        });
        if (!event || event.organizer?.id !== req.user.organizer.id) {
          const errors = { event: 'Оберіть подію, якою ви керуєте.' };
          const fields = await buildFields(config, null, req.body, errors, req.user);
          return renderForm(req, res, key, id, fields, errors, 422);
        }
      }
    }

    const { errors, data } = await validate(full, req.body, id);
    if (Object.keys(errors).length > 0) {
      const fields = await buildFields(config, null, req.body, errors, req.user);
      return renderForm(req, res, key, id, fields, errors, 422);
    }

    try {
      const repository = AppDataSource.getRepository(full.entity);
      if (!id && key === 'tickets') {
        data.code = await nextTicketCode(data.event.id, data.category.id);
      }
      if (id) {
        const record = await repository.findOneBy({ id });
        if (!record) return notFound(req, res);
        repository.merge(record, data);
        await repository.save(record);
      } else {
        await repository.save(repository.create(data));
      }

      const redirect = `/${key}?notice=${id ? 'updated' : 'created'}`;
      if (wantsJson(req)) return res.json({ ok: true, redirect });
      return res.redirect(redirect);
    } catch (error) {
      const dbErrors = mapDbError(error, full);
      const fields = await buildFields(config, null, req.body, dbErrors, req.user);
      return renderForm(req, res, key, id, fields, dbErrors, 422);
    }
  };
}
