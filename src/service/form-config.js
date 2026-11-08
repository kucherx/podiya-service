import { ROLES } from '../auth/roles.js';

export function configForUser(config, user) {
  if (!user) return config;
  if (user.role === ROLES.ORGANIZER && config.entity === 'Event') {
    return {
      ...config,
      fields: config.fields.filter((field) => field.name !== 'organizer')
    };
  }
  if (user.role === ROLES.ORGANIZER && config.entity === 'Ticket') {
    return {
      ...config,
      fields: config.fields.filter((field) => field.name !== 'client')
    };
  }
  return config;
}
