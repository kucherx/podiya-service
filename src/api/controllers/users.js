import { AppDataSource } from '../../db/data-source.js';
import { ROLES } from '../../auth/roles.js';
import { publicInfo } from '../../auth/user-view.js';
import { resetUserPassword, saveUserRecord, validateUserPayload } from '../../service/admin-users.js';
import { jsonError, parseId } from '../helpers.js';

function repository() {
  return AppDataSource.getRepository('User');
}

function sanitize(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: publicInfo(user).name,
    client: user.client ? { id: user.client.id, fullName: user.client.fullName, email: user.client.email } : null,
    organizer: user.organizer ? { id: user.organizer.id, name: user.organizer.name, email: user.organizer.email } : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function valuesFrom(body, existing = {}) {
  return {
    email: String(body.email ?? existing.email ?? '').trim().toLowerCase(),
    role: String(body.role ?? existing.role ?? ROLES.CLIENT),
    organizerId: String(body.organizerId ?? existing.organizer?.id ?? ''),
    clientId: String(body.clientId ?? existing.client?.id ?? ''),
    password: String(body.password ?? '')
  };
}

function requireAdmin(req, res) {
  if (req.user?.role !== ROLES.ADMIN) {
    jsonError(res, 403, 'Доступ заборонено.');
    return false;
  }
  return true;
}

export async function listUsers(req, res) {
  if (!requireAdmin(req, res)) return;
  const users = await repository().find({
    relations: { client: true, organizer: true },
    order: { id: 'ASC' }
  });
  return res.json(users.map(sanitize));
}

export async function readUser(req, res) {
  if (!requireAdmin(req, res)) return;
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Користувача не знайдено.');
  const user = await repository().findOne({
    where: { id },
    relations: { client: true, organizer: true }
  });
  if (!user) return jsonError(res, 404, 'Користувача не знайдено.');
  return res.json(sanitize(user));
}

export async function createUser(req, res) {
  if (!requireAdmin(req, res)) return;
  const values = valuesFrom(req.body);
  const { errors, organizer, client } = await validateUserPayload({
    values,
    id: null,
    currentUserId: req.user.id
  });
  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, message: 'Помилка валідації.', errors });
  }
  const user = await saveUserRecord({ id: null, values, organizer, client });
  const full = await repository().findOne({
    where: { id: user.id },
    relations: { client: true, organizer: true }
  });
  return res.status(201).json(sanitize(full));
}

export async function updateUser(req, res) {
  if (!requireAdmin(req, res)) return;
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Користувача не знайдено.');
  const existing = await repository().findOne({
    where: { id },
    relations: { client: true, organizer: true }
  });
  if (!existing) return jsonError(res, 404, 'Користувача не знайдено.');

  const values = valuesFrom(req.body, existing);
  const { errors, organizer, client } = await validateUserPayload({
    values,
    id,
    currentUserId: req.user.id
  });
  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, message: 'Помилка валідації.', errors });
  }

  const user = await saveUserRecord({ id, values, organizer, client });
  const full = await repository().findOne({
    where: { id: user.id },
    relations: { client: true, organizer: true }
  });
  return res.json(sanitize(full));
}

export async function deleteUser(req, res) {
  if (!requireAdmin(req, res)) return;
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Користувача не знайдено.');
  if (id === req.user.id) return jsonError(res, 400, 'Не можна видалити власний акаунт.');
  const result = await repository().delete(id);
  if (!result.affected) return jsonError(res, 404, 'Користувача не знайдено.');
  return res.status(204).end();
}

export async function resetPassword(req, res) {
  if (!requireAdmin(req, res)) return;
  const id = parseId(req.params.id);
  if (!id) return jsonError(res, 404, 'Користувача не знайдено.');
  const result = await resetUserPassword(id);
  if (!result) return jsonError(res, 404, 'Користувача не знайдено.');
  return res.json({
    ok: true,
    password: result.password,
    user: sanitize(result.user)
  });
}
