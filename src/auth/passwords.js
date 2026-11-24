import bcrypt from 'bcryptjs';

export const PASSWORD_MIN_LENGTH = 12;

/**
 * Повертає текст помилки або null, якщо пароль достатньо надійний.
 * Для генерації використовується crypto.randomInt, для зберігання — bcrypt.
 */
export function passwordProblem(password) {
  const value = String(password || '');
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Пароль має містити щонайменше ${PASSWORD_MIN_LENGTH} символів.`;
  }
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(value)) {
    return 'Пароль має містити хоча б одну літеру.';
  }
  if (!/\d/.test(value)) {
    return 'Пароль має містити хоча б одну цифру.';
  }
  return null;
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
