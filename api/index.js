import 'dotenv/config';
import app from '../src/app.js';
import { ensureDb } from '../src/db/bootstrap.js';

let ready = null;

export default async function handler(req, res) {
  try {
    ready ??= ensureDb();
    await ready;
    return app(req, res);
  } catch (error) {
    ready = null;
    console.error('[vercel] Не вдалося ініціалізувати застосунок:', error.message);
    return res.status(500).json({ message: 'Не вдалося підключитися до бази даних.' });
  }
}
