import { Not } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';
import { navigationFor } from '../view/navigation.js';
import { ROLES, ROLE_LABELS } from '../auth/roles.js';
import { hashPassword } from '../auth/passwords.js';
import { wantsJson } from '../lib/request.js';
import { renderError } from '../lib/render-error.js';

const roleOptions = [
  { value: ROLES.CLIENT, label: ROLE_LABELS.client },
  { value: ROLES.ORGANIZER, label: ROLE_LABELS.organizer },
  { value: ROLES.ADMIN, label: ROLE_LABELS.admin }
];

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function repository() {
  return AppDataSource.getRepository('User');
}

async function linkedRecords(role, values, id) {
  const link = { organizer: null, client: null, errors: {} };
  const duplicate = (relation, recordId) => repository().count({
    where: { [relation]: { id: recordId }, ...(id ? { id: Not(id) } : {}) }
  });

  if (role === ROLES.ORGANIZER) {
    link.organizer = values.organizerId
      ? await AppDataSource.getRepository('Organizer').findOneBy({ id: Number(values.organizerId) })
      : null;
    if (!link.organizer) link.errors.organizerId = 'Оберіть організатора.';
    else if (await duplicate('organizer', link.organizer.id)) link.errors.organizerId = 'У цього організатора вже є акаунт.';
  }

  if (role === ROLES.CLIENT) {
    link.client = values.clientId
      ? await AppDataSource.getRepository('Client').findOneBy({ id: Number(values.clientId) })
      : null;
    if (!link.client) link.errors.clientId = 'Оберіть клієнта.';
    else if (await duplicate('client', link.client.id)) link.errors.clientId = 'У цього клієнта вже є акаунт.';
  }

  return link;
}

async function renderForm(req, res, { id = null, values = {}, errors = {}, status = 200 }) {
  const [organizers, clients] = await Promise.all([
    AppDataSource.getRepository('Organizer').find({ order: { name: 'ASC' } }),
    AppDataSource.getRepository('Client').find({ order: { fullName: 'ASC' } })
  ]);
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

  res.status(status).render('user-form', {
    title: id ? 'Редагувати користувача' : 'Створити користувача',
    active: 'users',
    nav: navigationFor(req.user.role),
    roles: roleOptions,
    organizers,
    clients,
    values: data,
    errors,
    isEdit: Boolean(id),
    action: id ? `/users/${id}` : '/users'
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
    clientId: String(req.body.clientId || '')
  };
  const password = String(req.body.password || '');
  const errors = {};

  if (!emailPattern.test(values.email)) errors.email = 'Введіть коректну email-адресу.';
  if (!roleOptions.some((option) => option.value === values.role)) errors.role = 'Оберіть коректну роль.';
  if (id === req.user.id && values.role !== ROLES.ADMIN) errors.role = 'Не можна змінити роль власного акаунта.';
  if (!id && password.length < 8) errors.password = 'Пароль має містити щонайменше 8 символів.';

  if (!errors.email && await repository().count({ where: { email: values.email, ...(id ? { id: Not(id) } : {}) } })) {
    errors.email = 'Користувач із такою поштою вже існує.';
  }

  const link = await linkedRecords(values.role, values, id);
  Object.assign(errors, link.errors);

  if (Object.keys(errors).length) return renderForm(req, res, { id, values, errors, status: 422 });

  if (id) {
    const user = await repository().findOneBy({ id });
    if (!user) return renderError(req, res, 404, 'Користувача не знайдено', 'Такого користувача не існує.');
    repository().merge(user, { email: values.email, role: values.role, organizer: link.organizer, client: link.client });
    await repository().save(user);
  } else {
    await repository().save(repository().create({
      email: values.email,
      role: values.role,
      passwordHash: await hashPassword(password),
      organizer: link.organizer,
      client: link.client
    }));
  }

  if (wantsJson(req)) return res.json({ ok: true, redirect: '/users' });
  return res.redirect('/users');
}
