import { AppDataSource } from '../../db/data-source.js';
import { formConfig } from '../../view/forms/index.js';
import { validate } from '../../validation/validate.js';
import { comparePassword, hashPassword } from '../../auth/passwords.js';
import { publicInfo } from '../../auth/user-view.js';
import { ROLES } from '../../auth/roles.js';
import { jsonError } from '../helpers.js';

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const errors = {};

  if (!emailPattern.test(email)) errors.email = 'Введіть коректну email-адресу.';
  if (!password) errors.password = 'Введіть пароль.';
  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  const user = await AppDataSource.getRepository('User').findOne({
    where: { email },
    relations: { client: true, organizer: true }
  });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.status(422).json({ ok: false, errors: { _form: 'Невірний email або пароль.' } });
  }

  return req.login(user, (error) => {
    if (error) return jsonError(res, 500, 'Не вдалося увійти.');
    return res.json({
      ok: true,
      auth: true,
      redirect: user.role === ROLES.ADMIN ? '/' : '/events',
      user: publicInfo(user)
    });
  });
}

export async function register(req, res) {
  const values = {
    fullName: String(req.body.fullName || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    phone: String(req.body.phone || '').trim(),
    city: String(req.body.city || '').trim()
  };
  const password = String(req.body.password || '');
  const confirm = String(req.body.passwordConfirm || '');
  const { errors, data } = await validate(formConfig.clients, values, null);

  if (!password) errors.password = 'Введіть пароль.';
  else if (password.length < 8) errors.password = 'Пароль має містити щонайменше 8 символів.';
  if (password !== confirm) errors.passwordConfirm = 'Паролі не збігаються.';

  if (!errors.email && await AppDataSource.getRepository('User').count({ where: { email: values.email } })) {
    errors.email = 'Користувач із такою поштою вже зареєстрований.';
  }

  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors, values });

  const clientRepository = AppDataSource.getRepository('Client');
  const client = await clientRepository.save(clientRepository.create(data));
  const userRepository = AppDataSource.getRepository('User');
  const user = await userRepository.save(userRepository.create({
    email: values.email,
    passwordHash: await hashPassword(password),
    role: ROLES.CLIENT,
    client
  }));

  return req.login(user, (error) => {
    if (error) return jsonError(res, 500, 'Не вдалося створити сесію.');
    return res.status(201).json({
      ok: true,
      auth: true,
      redirect: '/events',
      user: publicInfo(user)
    });
  });
}

export function logout(req, res, next) {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy(() => res.json({ ok: true, redirect: '/' }));
  });
}

export function me(req, res) {
  if (!req.user) return jsonError(res, 401, 'Потрібна авторизація.');
  return res.json({
    id: req.user.id,
    role: req.user.role,
    ...publicInfo(req.user),
    clientId: req.user.client?.id || null,
    organizerId: req.user.organizer?.id || null
  });
}
