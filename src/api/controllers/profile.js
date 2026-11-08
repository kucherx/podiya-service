import { Not } from 'typeorm';
import { AppDataSource } from '../../db/data-source.js';
import { formConfig } from '../../view/forms/index.js';
import { validate } from '../../validation/validate.js';
import { comparePassword, hashPassword } from '../../auth/passwords.js';
import { publicInfo } from '../../auth/user-view.js';
import { ROLES } from '../../auth/roles.js';
import { jsonError } from '../helpers.js';

const adminConfig = {
  entity: 'User',
  fields: [
    { name: 'email', label: 'Email', type: 'email', required: true, unique: true, maxLength: 160 }
  ]
};

function configFor(user) {
  if (user.role === ROLES.CLIENT) return formConfig.clients;
  if (user.role === ROLES.ORGANIZER) return formConfig.organizers;
  return adminConfig;
}

function recordFor(user) {
  if (user.role === ROLES.CLIENT) return user.client;
  if (user.role === ROLES.ORGANIZER) return user.organizer;
  return user;
}

export function getProfile(req, res) {
  if (!req.user) return jsonError(res, 401, 'Потрібна авторизація.');
  const record = req.user.role === ROLES.ADMIN
    ? { email: req.user.email }
    : recordFor(req.user);
  return res.json({
    id: req.user.id,
    role: req.user.role,
    ...publicInfo(req.user),
    clientId: req.user.client?.id || null,
    organizerId: req.user.organizer?.id || null,
    record
  });
}

export async function updateProfile(req, res) {
  if (!req.user) return jsonError(res, 401, 'Потрібна авторизація.');
  const config = configFor(req.user);
  const record = recordFor(req.user);
  const { errors, data } = await validate(config, req.body, record.id);

  if (req.user.role !== ROLES.ADMIN && !errors.email) {
    const email = String(data.email || '').toLowerCase();
    const occupied = await AppDataSource.getRepository('User').count({
      where: { email, id: Not(req.user.id) }
    });
    if (occupied) errors.email = 'Користувач із такою поштою вже зареєстрований.';
  }

  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, message: 'Помилка валідації.', errors });
  }

  if (data.email) data.email = data.email.toLowerCase();

  if (req.user.role === ROLES.ADMIN) {
    req.user.email = data.email;
    await AppDataSource.getRepository('User').save(req.user);
  } else {
    const entity = req.user.role === ROLES.CLIENT ? 'Client' : 'Organizer';
    const repository = AppDataSource.getRepository(entity);
    repository.merge(record, data);
    const saved = await repository.save(record);
    if (req.user.role === ROLES.CLIENT) req.user.client = saved;
    else req.user.organizer = saved;
    req.user.email = data.email;
    await AppDataSource.getRepository('User').save(req.user);
  }

  return res.json({ ok: true, redirect: '/profile', profile: publicInfo(req.user) });
}

export async function updatePassword(req, res) {
  if (!req.user) return jsonError(res, 401, 'Потрібна авторизація.');
  const current = String(req.body.currentPassword || '');
  const next = String(req.body.newPassword || '');
  const confirm = String(req.body.confirmPassword || '');
  const errors = {};

  if (!current) errors.currentPassword = 'Введіть поточний пароль.';
  else if (!(await comparePassword(current, req.user.passwordHash))) {
    errors.currentPassword = 'Поточний пароль неправильний.';
  }
  if (!next) errors.newPassword = 'Введіть новий пароль.';
  else if (next.length < 8) errors.newPassword = 'Пароль має містити щонайменше 8 символів.';
  if (next !== confirm) errors.confirmPassword = 'Паролі не збігаються.';

  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, message: 'Помилка валідації.', errors });
  }

  req.user.passwordHash = await hashPassword(next);
  await AppDataSource.getRepository('User').save(req.user);
  return res.json({ ok: true, redirect: '/profile' });
}
