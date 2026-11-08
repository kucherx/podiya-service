import { AppDataSource } from '../db/data-source.js';
import { navigationFor } from '../view/navigation.js';
import { ROLES } from '../auth/roles.js';
import {
  roleOptions,
  saveUserRecord,
  userOptions,
  validateUserPayload
} from '../service/admin-users.js';
import { wantsJson } from '../lib/request.js';
import { renderError } from '../lib/render-error.js';

function repository() {
  return AppDataSource.getRepository('User');
}

async function renderForm(req, res, { id = null, values = {}, errors = {}, status = 200 }) {
  const { organizers, clients } = await userOptions();
  const user = id
    ? await repository().findOne({ where: { id }, relations: { organizer: true, client: true } })
    : null;

  if (id && !user) {
    return renderError(req, res, 404, 'Користувача не знайдено', 'Такого користувача не існує.');
  }

  const data = Object.keys(values).length ? values : {
    email: user?.email || '',
    role: user?.role || ROLES.CLIENT,
    organizerId: user?.organizer?.id || '',
    clientId: user?.client?.id || ''
  };
  data.organizerId = data.organizerId ? Number(data.organizerId) : '';
  data.clientId = data.clientId ? Number(data.clientId) : '';

  return res.status(status).render('user-form', {
    title: id ? 'Редагувати користувача' : 'Створити користувача',
    active: 'users',
    nav: navigationFor(req.user.role),
    roles: roleOptions,
    organizers,
    clients,
    values: data,
    errors,
    isEdit: Boolean(id),
    action: id ? `/users/${id}` : '/users',
    apiAction: id ? `/api/users/${id}` : '/api/users',
    redirect: '/users'
  });
}

export function newUser(req, res) {
  return renderForm(req, res, {});
}

export function editUser(req, res) {
  return renderForm(req, res, { id: Number(req.params.id) });
}

export async function saveUser(req, res) {
  const id = req.params.id ? Number(req.params.id) : null;
  const values = {
    email: String(req.body.email || '').trim().toLowerCase(),
    role: String(req.body.role || ''),
    organizerId: String(req.body.organizerId || ''),
    clientId: String(req.body.clientId || ''),
    password: String(req.body.password || '')
  };

  const { errors, organizer, client } = await validateUserPayload({
    values,
    id,
    currentUserId: req.user.id
  });

  if (Object.keys(errors).length) {
    return renderForm(req, res, { id, values, errors, status: 422 });
  }

  const user = await saveUserRecord({ id, values, organizer, client });
  if (!user) {
    return renderError(req, res, 404, 'Користувача не знайдено', 'Такого користувача не існує.');
  }

  if (wantsJson(req)) return res.json({ ok: true, redirect: '/users' });
  return res.redirect('/users');
}
