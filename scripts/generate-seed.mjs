import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { locations } from '../src/db/seed/data/locations.js';
import { organizers } from '../src/db/seed/data/organizers.js';
import { clients } from '../src/db/seed/data/clients.js';
import { categories } from '../src/db/seed/data/categories.js';
import { events } from '../src/db/seed/data/events.js';
import {
  adminAccount,
  organizerPassword,
  clientPassword
} from '../src/db/seed/data/users.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'db', 'seed.sql');

const q = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
};
const n = (value) => Number(value);

const lines = [];
const push = (line = '') => lines.push(line);

push('-- Podiya — демонстраційні дані для PostgreSQL (Neon)');
push('-- Паролі в цьому файлі наведені у відкритому вигляді.');
push('-- У базу вони потрапляють уже як bcrypt-хеші завдяки pgcrypto crypt().');
push('-- Після виконання schema.sql цей файл можна запускати повторно.');
push('');
push('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
push('');

push('-- Локації');
for (const item of locations) {
  push(`INSERT INTO "locations" ("name", "city", "address", "capacity") VALUES (${q(item.name)}, ${q(item.city)}, ${q(item.address)}, ${n(item.capacity)});`);
}
push('');

push('-- Організатори');
for (const item of organizers) {
  push(`INSERT INTO "organizers" ("name", "city", "email", "phone", "website", "description") VALUES (${q(item.name)}, ${q(item.city)}, ${q(item.email)}, ${q(item.phone)}, ${q(item.website)}, ${q(item.description)});`);
}
push('');

push('-- Клієнти');
for (const item of clients) {
  push(`INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES (${q(item.fullName)}, ${q(item.email)}, ${q(item.phone)}, ${q(item.city)});`);
}
push('');

push('-- Категорії квитків');
for (const item of categories) {
  push(`INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES (${q(item.name)}, ${q(item.description)}, ${n(item.price)}, ${n(item.quantity)});`);
}
push('');

const categoryId = new Map(categories.map((item, index) => [item.name, index + 1]));

push('-- Події');
events.forEach((item, index) => {
  push(`INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES (${q(item.title)}, ${q(item.description)}, ${q(item.startsAt.replace('T', ' ').replace('.000Z', '+02:00'))}, ${q(item.endsAt.replace('T', ' ').replace('.000Z', '+02:00'))}, ${q(item.status)}, ${item.location + 1}, ${item.organizer + 1});`);
});
push('');

push('-- Зв’язки подія ↔ категорія');
events.forEach((item, eventIndex) => {
  for (const name of item.categories) {
    push(`INSERT INTO "event_categories" ("event_id", "category_id") VALUES (${eventIndex + 1}, ${categoryId.get(name)});`);
  }
});
push('');

push('-- Квитки: по три на кожну категорію події');
events.forEach((item, eventIndex) => {
  item.categories.forEach((name, categoryIndex) => {
    for (let ticketIndex = 0; ticketIndex < 3; ticketIndex += 1) {
      const code = `POD-${String(eventIndex + 1).padStart(2, '0')}-${String(categoryIndex + 1).padStart(2, '0')}-${String(ticketIndex + 1).padStart(2, '0')}`;
      const sold = ticketIndex === 0;
      const reserved = ticketIndex === 2;
      const status = sold ? 'sold' : reserved ? 'reserved' : 'available';
      const client = sold || reserved ? ((eventIndex + categoryIndex) % clients.length) + 1 : null;
      const price = categories[categoryId.get(name) - 1].price;
      const purchasedAt = sold ? `2026-11-${String(10 + eventIndex).padStart(2, '0')} 12:00:00+02:00` : null;
      const paidAt = sold ? `2026-11-${String(10 + eventIndex).padStart(2, '0')} 13:00:00+02:00` : null;
      const checkedInAt = sold ? `2026-11-${String(12 + eventIndex).padStart(2, '0')} 18:00:00+02:00` : null;
      push(`INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES (${q(code)}, ${q(status)}, ${n(price)}, 1, ${purchasedAt ? q(purchasedAt) : 'NULL'}, ${paidAt ? q(paidAt) : 'NULL'}, ${checkedInAt ? q(checkedInAt) : 'NULL'}, ${eventIndex + 1}, ${categoryId.get(name)}, ${client ?? 'NULL'});`);
    }
  });
});
push('');

push('-- Користувачі. Паролі хешуються pgcrypto (bcrypt, cost 12).');
push(`-- admin: ${adminAccount.email} / ${adminAccount.password}`);
push(`-- organizers: ${organizerPassword}`);
push(`-- clients: ${clientPassword}`);
push(`INSERT INTO "users" ("email", "passwordHash", "role") VALUES (${q(adminAccount.email)}, crypt(${q(adminAccount.password)}, gen_salt('bf', 12)), 'admin');`);
organizers.forEach((item, index) => {
  push(`INSERT INTO "users" ("email", "passwordHash", "role", "organizer_id") VALUES (${q(item.email.toLowerCase())}, crypt(${q(organizerPassword)}, gen_salt('bf', 12)), 'organizer', ${index + 1});`);
});
clients.forEach((item, index) => {
  push(`INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES (${q(item.email.toLowerCase())}, crypt(${q(clientPassword)}, gen_salt('bf', 12)), 'client', ${index + 1});`);
});
push('');

push('-- Послідовності після явних id');
for (const table of ['locations', 'organizers', 'clients', 'ticket_categories', 'events', 'tickets', 'users']) {
  push(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX("id") FROM "${table}"), 1), true);`);
}
push('');

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Записано ${outFile}: ${lines.length} рядків`);
