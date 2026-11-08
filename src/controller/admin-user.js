import { AppDataSource } from '../db/data-source.js';
import { navigationFor } from '../view/navigation.js';
import { publicInfo } from '../auth/user-view.js';
import { resetUserPassword } from '../service/admin-users.js';
import { wantsJson } from '../lib/request.js';

function repository() {
  return AppDataSource.getRepository('User');
}

export async function listUsers(req, res) {
  res.render('users', {
    title: 'Користувачі',
    active: 'users',
    nav: navigationFor(req.user.role),
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
  const result = await resetUserPassword(Number(req.params.id));
  if (!result) return res.status(404).json({ ok: false, message: 'Користувача не знайдено.' });

  res.json({
    password: result.password,
    name: publicInfo(result.user).name,
    email: result.user.email
  });
}
