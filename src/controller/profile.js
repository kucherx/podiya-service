import { Not } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';
import { buildFields } from '../service/form-fields.js';
import { validate } from '../validation/validate.js';
import { comparePassword, hashPassword } from '../auth/passwords.js';
import { ROLES, ROLE_LABELS } from '../auth/roles.js';
import { publicInfo } from '../auth/user-view.js';
import { navigationFor } from '../view/navigation.js';
import { wantsJson } from '../lib/request.js';

const adminConfig = {
  entity: 'User',
  fields: [
    { name: 'email', label: 'Email', type: 'email', required: true, unique: true, maxLength: 160, placeholder: 'admin@gmail.com' }
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

async function renderProfile(req, res, fields, profileErrors, passwordErrors, status = 200) {
  res.status(status).render('profile', {
    title: 'Профіль',
    active: 'profile',
    nav: navigationFor(req.user.role),
    roleLabel: ROLE_LABELS[req.user.role],
    info: publicInfo(req.user),
    fields,
    profileErrors,
    passwordErrors
  });
}

export async function showProfile(req, res) {
  const config = configFor(req.user);
  const fields = await buildFields(config, recordFor(req.user), null, {});
  await renderProfile(req, res, fields, {}, {});
}

export async function updateProfile(req, res) {
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
    const fields = await buildFields(config, null, req.body, errors);
    return renderProfile(req, res, fields, errors, {}, 422);
  }

  if (data.email) data.email = data.email.toLowerCase();

  if (req.user.role === ROLES.ADMIN) {
    req.user.email = data.email.toLowerCase();
    await AppDataSource.getRepository('User').save(req.user);
  } else {
    const entity = req.user.role === ROLES.CLIENT ? 'Client' : 'Organizer';
    const repository = AppDataSource.getRepository(entity);
    repository.merge(record, data);
    await repository.save(record);
    req.user.email = data.email.toLowerCase();
    await AppDataSource.getRepository('User').save(req.user);
  }

  req.session.flash = { type: 'success', text: 'Профіль оновлено.' };
  if (wantsJson(req)) return res.json({ ok: true, redirect: '/profile' });
  res.redirect('/profile');
}

export async function updatePassword(req, res) {
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
    const config = configFor(req.user);
    const fields = await buildFields(config, recordFor(req.user), null, {});
    return renderProfile(req, res, fields, {}, errors, 422);
  }

  req.user.passwordHash = await hashPassword(next);
  await AppDataSource.getRepository('User').save(req.user);
  req.session.flash = { type: 'success', text: 'Пароль змінено.' };
  if (wantsJson(req)) return res.json({ ok: true, redirect: '/profile' });
  res.redirect('/profile');
}
