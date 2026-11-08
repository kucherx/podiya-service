import { AppDataSource } from '../db/data-source.js';
import { navigationFor } from '../view/navigation.js';
import { ROLE_LABELS } from '../auth/roles.js';
import { publicInfo } from '../auth/user-view.js';
import { hashPassword } from '../auth/passwords.js';
import { generatePassword } from '../auth/password-generator.js';
import { wantsJson } from '../lib/request.js';

function repository() {
  return AppDataSource.getRepository('User');
}

export async function listUsers(req, res) {
  const users = await repository().find({
    relations: { client: true, organizer: true },
    order: { id: 'ASC' }
  });

  res.render('users', {
    title: 'Користувачі',
    active: 'users',
    nav: navigationFor(req.user.role),
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      roleLabel: ROLE_LABELS[user.role] || user.role,
      name: publicInfo(user).name
    })),
    currentId: req.user.id
  });
}

export async function deleteUser(req, res) {
  const id = Number(req.params.id);
  if (id === req.user.id) {
    if (wantsJson(req)) return res.status(400).json({ ok: false, message: 'Не можна видалити власний акаунт.' });
    return res.redirect('/users');
  }
  await repository().delete(id);
  if (wantsJson(req)) return res.json({ ok: true, redirect: '/users?notice=deleted' });
  return res.redirect('/users?notice=deleted');
}

export async function resetPassword(req, res) {
  const id = Number(req.params.id);
  const user = await repository().findOne({ where: { id }, relations: { client: true, organizer: true } });
  if (!user) return res.status(404).json({ ok: false, message: 'Користувача не знайдено.' });

  const password = generatePassword(14);
  user.passwordHash = await hashPassword(password);
  await repository().save(user);

  res.json({
    password,
    name: publicInfo(user).name,
    email: user.email
  });
}
