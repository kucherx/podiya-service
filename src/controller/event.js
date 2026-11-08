import { navigationFor } from '../view/navigation.js';
import { messageFromQuery } from '../lib/messages.js';
import { ROLES } from '../auth/roles.js';
import { renderError } from '../lib/render-error.js';

export function showEvent(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return renderError(req, res, 404, 'Подію не знайдено', 'Такої події не існує.');
  }

  const role = req.user?.role || ROLES.GUEST;
  return res.render('event', {
    title: 'Подія',
    active: 'events',
    nav: navigationFor(role),
    eventId: id,
    role,
    authenticated: Boolean(req.user),
    message: messageFromQuery(req.query)
  });
}
