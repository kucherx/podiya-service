import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entity/index.js';

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL не заданий. Проєкт працює лише з PostgreSQL (Neon).');
}

const useSsl = process.env.DB_SSL !== 'false';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities,
  // Схема створюється з db/schema.sql, а не автоматично під час запиту.
  synchronize: false,
  logging: false,
  extra: {
    max: Number(process.env.DB_POOL_MAX) || 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  }
});
