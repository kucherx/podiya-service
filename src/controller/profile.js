import { formConfig } from '../view/forms/index.js';
import { buildFieldDefinitions } from '../service/form-fields.js';
import { ROLES, ROLE_LABELS } from '../auth/roles.js';
import { navigationFor } from '../view/navigation.js';

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

export function showProfile(req, res) {
  const config = configFor(req.user);
  res.render('profile', {
    title: 'Профіль',
    active: 'profile',
    nav: navigationFor(req.user.role),
    roleLabel: ROLE_LABELS[req.user.role],
    fields: buildFieldDefinitions(config),
    profileErrors: {},
    passwordErrors: {}
  });
}
