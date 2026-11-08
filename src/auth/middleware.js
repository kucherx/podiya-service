import { navigationFor } from '../view/navigation.js';
import { ROLES, ROLE_LABELS } from './roles.js';
import { publicInfo } from './user-view.js';

export function authLocals(req, res, next) {
  const user = req.user || null;
  const role = user?.role || ROLES.GUEST;

  res.locals.currentUser = user
    ? { id: user.id, role: user.role, ...publicInfo(user) }
    : null;
  res.locals.currentRole = role;
  res.locals.roleLabel = ROLE_LABELS[role];
  res.locals.nav = navigationFor(role);
  res.locals.flash = req.session.flash || null;
  res.locals.authModal = req.session.authModal || null;
  res.locals.authErrors = req.session.authErrors || {};
  res.locals.authValues = req.session.authValues || {};
  delete req.session.flash;
  delete req.session.authModal;
  delete req.session.authErrors;
  delete req.session.authValues;
  next();
}

export function requireGuest(req, res, next) {
  if (req.isAuthenticated?.()) return res.redirect('/profile');
  next();
}

export function requireAuth(req, res, next) {
  if (req.isAuthenticated?.()) return next();

  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ message: 'Потрібна авторизація.' });
  }

  req.session.returnTo = req.originalUrl;
  req.session.authModal = 'login';
  req.session.authErrors = { _form: 'Увійдіть, щоб продовжити.' };
  res.redirect('/');
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated?.()) return requireAuth(req, res, next);
    if (roles.includes(req.user.role)) return next();

    if (req.originalUrl.startsWith('/api')) {
      return res.status(403).json({ message: 'Доступ заборонено.' });
    }

    res.status(403).render('error', {
      title: 'Доступ заборонено',
      message: 'У вас немає прав для перегляду цієї сторінки.',
      active: null,
      nav: navigationFor(req.user.role)
    });
  };
}
