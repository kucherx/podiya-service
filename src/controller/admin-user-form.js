import { navigationFor } from '../view/navigation.js';
import { ROLES } from '../auth/roles.js';
import { roleOptions } from '../service/admin-users.js';

async function renderForm(req, res, { id = null, values = {}, errors = {}, status = 200 }) {
  const data = Object.keys(values).length ? values : {
    email: '',
    role: ROLES.CLIENT,
    organizerId: '',
    clientId: ''
  };
  data.organizerId = data.organizerId ? Number(data.organizerId) : '';
  data.clientId = data.clientId ? Number(data.clientId) : '';

  return res.status(status).render('user-form', {
    title: id ? 'Редагувати користувача' : 'Створити користувача',
    active: 'users',
    nav: navigationFor(req.user.role),
    roles: roleOptions,
    organizers: [],
    clients: [],
    values: data,
    errors,
    isEdit: Boolean(id),
    action: id ? `/users/${id}` : '/users',
    apiAction: id ? `/api/users/${id}` : '/api/users',
    redirect: '/users',
    resource: 'users',
    recordId: id
  });
}

export function newUser(req, res) {
  return renderForm(req, res, {});
}

export function editUser(req, res) {
  return renderForm(req, res, { id: Number(req.params.id) });
}
