import { navigationFor } from '../view/navigation.js';

export function listUsers(req, res) {
  res.render('users', {
    title: 'Користувачі',
    active: 'users',
    nav: navigationFor(req.user.role),
    currentId: req.user.id
  });
}
