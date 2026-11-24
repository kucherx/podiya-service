import generator from 'generate-password';

/**
 * Криптографічно стійкий пароль: 20 символів, великі й малі літери,
 * цифри та символи, без схожих символів (0/O, 1/l).
 */
export function generatePassword(length = 20) {
  return generator.generate({
    length,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true,
    excludeSimilarCharacters: true
  });
}
