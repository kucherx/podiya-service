#!/usr/bin/env node
/**
 * Повне перестворення бази Podiya: schema.sql + seed.sql.
 *
 *   npm run db:reset             # Neon з DATABASE_URL
 *   npm run db:reset -- --local  # локальна PostgreSQL з DB_*
 *   npm run db:reset -- --yes    # без підтвердження
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import pg from 'pg';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const args = process.argv.slice(2);
const useLocal = args.includes('--local');
const assumeYes = args.includes('--yes');

const localConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'podiya'
};

const neonUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const localUrl = process.env.LOCAL_DATABASE_URL
  || `postgresql://${localConfig.user}:${encodeURIComponent(localConfig.password)}@${localConfig.host}:${localConfig.port}/${localConfig.database}`;

const connectionString = useLocal ? localUrl : neonUrl;
if (!connectionString) {
  console.error('Немає DATABASE_URL. Додайте його в .env або запустіть з --local.');
  process.exit(1);
}

const describe = () => {
  try {
    const parsed = new URL(connectionString);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return useLocal ? 'локальна PostgreSQL' : 'Neon';
  }
};

const client = new pg.Client({
  connectionString,
  ssl: useLocal || process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

const ensureLocalDatabase = async () => {
  if (!useLocal) return;
  const admin = new pg.Client({
    host: localConfig.host,
    port: localConfig.port,
    user: localConfig.user,
    password: localConfig.password,
    database: 'postgres',
    ssl: false
  });
  await admin.connect();
  try {
    const found = await admin.query('select 1 from pg_database where datname = $1', [localConfig.database]);
    if (found.rowCount === 0) {
      if (!/^[a-zA-Z0-9_]+$/.test(localConfig.database)) throw new Error('Некоректна назва локальної бази.');
      await admin.query(`create database "${localConfig.database}"`);
      console.log(`Створено локальну базу ${localConfig.database}.`);
    }
  } finally {
    await admin.end();
  }
};

const confirm = async () => {
  if (assumeYes) return;
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(
      `\nБуде повністю очищено ${describe()}.\nВведіть YES, щоб продовжити: `
    );
    if (answer.trim() !== 'YES') {
      console.log('Скасовано.');
      process.exit(2);
    }
  } finally {
    rl.close();
  }
};

const main = async () => {
  await confirm();
  await ensureLocalDatabase();

  const schema = readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8');
  const seed = readFileSync(path.join(root, 'db', 'seed.sql'), 'utf8');

  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query(seed);
    await client.query('COMMIT');

    const counts = await client.query(`
      select 'локації' as entity, count(*)::int as total from locations
      union all select 'організатори', count(*)::int from organizers
      union all select 'клієнти', count(*)::int from clients
      union all select 'події', count(*)::int from events
      union all select 'категорії', count(*)::int from ticket_categories
      union all select 'квитки', count(*)::int from tickets
      union all select 'користувачі', count(*)::int from users
    `);

    console.log(`\nГотово: ${describe()}`);
    for (const row of counts.rows) console.log(`  ${row.entity.padEnd(13)} ${row.total}`);
    console.log('\nДемо-акаунти:');
    console.log('  admin: event.manager.podiya@gmail.com / Adm!n-Podiya-2026-Kx7Q');
    console.log('  organizer: kyiv.event.yard@gmail.com / Org!n-Podiya-2026-Lm3T');
    console.log('  client: myroslava.havryliuk@gmail.com / Cl!ent-Podiya-2026-Rp9V');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error('\nПомилка:', error.message);
  process.exit(1);
});
