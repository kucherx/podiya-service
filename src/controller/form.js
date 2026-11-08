import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';
import { navigation } from '../view/navigation.js';
import { buildFields, loadRecord } from '../service/form-fields.js';
import { validate } from '../validation/validate.js';
import { mapDbError } from '../validation/db-errors.js';
import { nextTicketCode } from '../service/ticket-code.js';

function parsedId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function renderForm(res, key, id, fields, errors, status = 200) {
  const config = formConfig[key];
  res.status(status).render('form', {
    title: id ? `Редагувати ${config.singular}` : `Створити ${config.singular}`,
    active: key,
    nav: navigation,
    config,
    isEdit: Boolean(id),
    fields,
    errors,
    action: id ? `/${key}/${id}` : `/${key}`,
    cancelHref: `/${key}`,
    submitLabel: id ? 'Зберегти зміни' : 'Створити запис'
  });
}

function notFound(res, key, message = 'Запис не знайдено.') {
  res.status(404).render('error', {
    title: 'Запис не знайдено',
    message,
    active: key,
    nav: navigation
  });
}

export function showForm(key) {
  return async (req, res) => {
    const config = formConfig[key];
    const id = req.params.id ? parsedId(req.params.id) : null;

    if (req.params.id && !id) return notFound(res, key, 'Некоректний ідентифікатор запису.');

    const record = id ? await loadRecord(config, id) : null;
    if (id && !record) return notFound(res, key);

    const fields = await buildFields(config, record, null, {});
    renderForm(res, key, id, fields, {});
  };
}

export function saveForm(key) {
  return async (req, res) => {
    const config = formConfig[key];
    const id = req.params.id ? parsedId(req.params.id) : null;

    if (req.params.id && !id) return notFound(res, key, 'Некоректний ідентифікатор запису.');

    const { errors, data } = await validate(config, req.body, id);

    if (Object.keys(errors).length > 0) {
      const fields = await buildFields(config, null, req.body, errors);
      return renderForm(res, key, id, fields, errors, 422);
    }

    try {
      const repository = AppDataSource.getRepository(config.entity);
      if (!id && key === 'tickets') {
        data.code = await nextTicketCode(data.event.id, data.category.id);
      }
      if (id) {
        const record = await repository.findOneBy({ id });
        if (!record) return notFound(res, key);
        repository.merge(record, data);
        await repository.save(record);
      } else {
        await repository.save(repository.create(data));
      }

      return res.redirect(`/${key}?notice=${id ? 'updated' : 'created'}`);
    } catch (error) {
      const errors = mapDbError(error, config);
      const fields = await buildFields(config, null, req.body, errors);
      return renderForm(res, key, id, fields, errors, 422);
    }
  };
}
