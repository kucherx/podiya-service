import { Not } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';
import { ROLES, ROLE_LABELS } from '../auth/roles.js';
import { hashPassword } from '../auth/passwords.js';
import { generatePassword } from '../auth/password-generator.js';

export const roleOptions = [
  { value: ROLES.CLIENT, label: ROLE_LABELS.client },
  { value: ROLES.ORGANIZER, label: ROLE_LABELS.organizer },
  { value: ROLES.ADMIN, label: ROLE_LABELS.admin }
];

export const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function repository() {
  return AppDataSource.getRepository('User');
}

export async function userOptions() {
  const [organizers, clients] = await Promise.all([
    AppDataSource.getRepository('Organizer').find({ order: { name: 'ASC' } }),
    AppDataSource.getRepository('Client').find({ order: { fullName: 'ASC' } })
  ]);
  return { organizers, clients };
}

export async function validateUserPayload({ values, id, currentUserId }) {
  const errors = {};
  const link = { organizer: null, client: null };
  const duplicate = (relation, recordId) => repository().count({
    where: { [relation]: { id: recordId }, ...(id ? { id: Not(id) } : {}) }
  });

  if (!emailPattern.test(values.email)) errors.email = 'Введіть коректну email-адресу.';
  if (!roleOptions.some((option) => option.value === values.role)) errors.role = 'Оберіть коректну роль.';
  if (id === currentUserId && values.role !== ROLES.ADMIN) {
    errors.role = 'Не можна змінити роль власного акаунта.';
  }
  if (!id && values.password.length < 8) {
    errors.password = 'Пароль має містити щонайменше 8 символів.';
  }

  if (!errors.email && await repository().count({
    where: { email: values.email, ...(id ? { id: Not(id) } : {}) }
  })) {
    errors.email = 'Користувач із такою поштою вже існує.';
  }

  if (values.role === ROLES.ORGANIZER) {
    link.organizer = values.organizerId
      ? await AppDataSource.getRepository('Organizer').findOneBy({ id: Number(values.organizerId) })
      : null;
    if (!link.organizer) link.organizerId = 'Оберіть організатора.';
    else if (await duplicate('organizer', link.organizer.id)) link.organizerId = 'У цього організатора вже є акаунт.';
  }

  if (values.role === ROLES.CLIENT) {
    link.client = values.clientId
      ? await AppDataSource.getRepository('Client').findOneBy({ id: Number(values.clientId) })
      : null;
    if (!link.client) link.clientId = 'Оберіть клієнта.';
    else if (await duplicate('client', link.client.id)) link.clientId = 'У цього клієнта вже є акаунт.';
  }

  if (link.organizerId) errors.organizerId = link.organizerId;
  if (link.clientId) errors.clientId = link.clientId;
  return { errors, organizer: link.organizer, client: link.client };
}

export async function saveUserRecord({ id, values, organizer, client }) {
  if (id) {
    const user = await repository().findOneBy({ id });
    if (!user) return null;
    repository().merge(user, { email: values.email, role: values.role, organizer, client });
    return repository().save(user);
  }

  return repository().save(repository().create({
    email: values.email,
    role: values.role,
    passwordHash: await hashPassword(values.password),
    organizer,
    client
  }));
}

export async function resetUserPassword(id) {
  const user = await repository().findOne({ where: { id }, relations: { client: true, organizer: true } });
  if (!user) return null;
  const password = generatePassword(14);
  user.passwordHash = await hashPassword(password);
  await repository().save(user);
  return { user, password };
}
