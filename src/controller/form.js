import { formConfig } from '../view/forms/index.js';
import { navigationFor } from '../view/navigation.js';
import { buildFieldDefinitions } from '../service/form-fields.js';
import { configForUser } from '../service/form-config.js';
import { renderError } from '../lib/render-error.js';

function parsedId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function renderForm(req, res, key, id, fields) {
  const full = formConfig[key];
  const config = configForUser(full, req.user);
  res.render('form', {
    title: id ? `Редагувати ${full.singular}` : `Створити ${full.singular}`,
    active: key,
    nav: navigationFor(req.user.role),
    config,
    isEdit: Boolean(id),
    fields,
    errors: {},
    action: id ? `/${key}/${id}` : `/${key}`,
    apiAction: id ? `/api/${key}/${id}` : `/api/${key}`,
    redirect: `/${key}`,
    resource: key,
    recordId: id,
    cancelHref: `/${key}`,
    submitLabel: id ? 'Зберегти зміни' : 'Створити запис'
  });
}

export function showForm(key) {
  return (req, res) => {
    const config = configForUser(formConfig[key], req.user);
    const id = req.params.id ? parsedId(req.params.id) : null;

    if (req.params.id && !id) {
      return renderError(req, res, 404, 'Запис не знайдено', 'Некоректний ідентифікатор запису.');
    }

    renderForm(req, res, key, id, buildFieldDefinitions(config));
  };
}
