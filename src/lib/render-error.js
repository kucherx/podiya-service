import { navigationFor } from '../view/navigation.js';
import { ROLES } from '../auth/roles.js';

export function renderError(req, res, status, title, message) {
  return res.status(status).render('error', {
    title,
    message,
    active: null,
    nav: navigationFor(req.user?.role || ROLES.GUEST)
  });
}
