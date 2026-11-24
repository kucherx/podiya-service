import { AppDataSource } from './data-source.js';

let ready = null;

/**
 * Ініціалізує пул TypeORM один раз на інстанс.
 * На Vercel функція живе між запитами, тому повторна ініціалізація не потрібна.
 */
export function ensureDb() {
  if (!ready) {
    ready = AppDataSource.initialize()
      .then(() => {
        console.log('[db] PostgreSQL підключено');
        return AppDataSource;
      })
      .catch((error) => {
        ready = null;
        throw error;
      });
  }

  return ready;
}
