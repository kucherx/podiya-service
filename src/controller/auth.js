import passport from 'passport';
import { AppDataSource } from '../db/data-source.js';
import { formConfig } from '../view/forms/index.js';
import { validate } from '../validation/validate.js';
import { hashPassword } from '../auth/passwords.js';
import { wantsJson } from '../lib/request.js';

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function remember(req, modal, errors, values) {
  req.session.authModal = modal;
  req.session.authErrors = errors;
  req.session.authValues = values;
}

function back(req) {
  return req.get('Referer') || '/';
}

function authError(req, res, modal, errors, values) {
  if (wantsJson(req)) {
    return res.status(422).json({ ok: false, modal, errors, values });
  }
  remember(req, modal, errors, values);
  return res.redirect(back(req));
}

function finishLogin(req, res, next, user, fallback) {
  const returnTo = req.session.returnTo;

  req.logIn(user, (error) => {
    if (error) return next(error);

    delete req.session.returnTo;
    const redirect = returnTo || fallback;

    if (wantsJson(req)) return res.json({ ok: true, redirect, auth: true });
    return res.redirect(redirect);
  });
}

export function postLogin(req, res, next) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const errors = {};

  if (!email) errors.email = 'Введіть email.';
  else if (!emailPattern.test(email)) errors.email = 'Введіть коректну email-адресу.';
  if (!password) errors.password = 'Введіть пароль.';

  if (Object.keys(errors).length) {
    return authError(req, res, 'login', errors, { email });
  }

  return passport.authenticate('local', (error, user, info) => {
    if (error) return next(error);
    if (!user) {
      return authError(req, res, 'login', { _form: info?.message || 'Невірний email або пароль.' }, { email });
    }
    return finishLogin(req, res, next, user, user.role === 'admin' ? '/' : '/events');
  })(req, res, next);
}

export function postRegister(req, res, next) {
  const values = {
    fullName: String(req.body.fullName || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    phone: String(req.body.phone || '').trim(),
    city: String(req.body.city || '').trim()
  };
  const password = String(req.body.password || '');
  const confirm = String(req.body.passwordConfirm || '');

  return validate(formConfig.clients, values, null).then(async ({ errors, data }) => {
    if (password.length < 8) errors.password = 'Пароль має містити щонайменше 8 символів.';
    if (!password) errors.password = 'Введіть пароль.';
    if (password !== confirm) errors.passwordConfirm = 'Паролі не збігаються.';

    const existingUser = await AppDataSource.getRepository('User').findOneBy({ email: values.email });
    if (existingUser) errors.email = 'Користувач із такою поштою вже зареєстрований.';

    if (Object.keys(errors).length) {
      return authError(req, res, 'register', errors, values);
    }

    const client = await AppDataSource.getRepository('Client').save(
      AppDataSource.getRepository('Client').create(data)
    );
    const user = await AppDataSource.getRepository('User').save({
      email: values.email,
      passwordHash: await hashPassword(password),
      role: 'client',
      client
    });

    return finishLogin(req, res, next, user, '/tickets');
  });
}

export function logout(req, res, next) {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy(() => res.redirect('/'));
  });
}
