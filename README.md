# Podiya

Платформа для публікації культурних подій, продажу квитків і контролю відвідування.
Серверний рендеринг сторінок і REST API працюють на одному Express-застосунку.

## Стек

- Node.js 22, ESM
- Express 5, `express-session`
- Passport (`passport-local`), `bcryptjs`
- Nunjucks
- TypeORM, PostgreSQL (Neon)
- `connect-pg-simple` для сесій у PostgreSQL
- `dotenv`

SQLite, `sql.js` і Handlebars у проєкті більше не використовуються. Застосунок
працює лише з PostgreSQL і читає `DATABASE_URL` зі змінних середовища.

## Ролі

- **Відвідувач** бачить лише опубліковані події. Може відкрити вхід і реєстрацію.
- **Клієнт** бачить опубліковані події, купує квитки, переглядає власні квитки й профіль.
- **Організатор** бачить і редагує лише свої події та квитки цих подій.
- **Адміністратор** має доступ до всіх довідників, подій, квитків і користувачів.

Доступ перевіряється на сервері. Клієнтські сторінки отримують дані через REST API,
а не через прямі запити до бази.

## Демо-акаунти

Паролі в `db/seed.sql` наведені відкрито, а в базу потрапляють уже як bcrypt-хеші
(`crypt(..., gen_salt('bf', 12))` через розширення `pgcrypto`).

| Роль | Email | Пароль |
| --- | --- | --- |
| Адміністратор | `event.manager.podiya@gmail.com` | `Adm!n-Podiya-2026-Kx7Q` |
| Організатор | `kyiv.event.yard@gmail.com` | `Org!n-Podiya-2026-Lm3T` |
| Клієнт | `myroslava.havryliuk@gmail.com` | `Cl!ent-Podiya-2026-Rp9V` |

Решта організаторів і клієнтів зі сіду використовує той самий пароль для своєї ролі.

## Паролі

- Нові паролі створюються у формі, перевіряються на довжину (12+), літеру й цифру.
- Застосунок хешує їх `bcryptjs` з cost 12 перед записом у базу.
- Кнопка скидання пароля генерує 16-символьний пароль через `crypto.randomInt`.
- Сід використовує `pgcrypto`, тому в SQL-файлі пароль читається, а в базі лежить хеш.

## REST API

Базовий шлях: `/api`.

| Метод | Шлях | Призначення |
| --- | --- | --- |
| GET | `/api` | індекс ресурсів |
| GET | `/api/health` | стан підключення до PostgreSQL |
| POST | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` | вхід, реєстрація, вихід |
| GET | `/api/auth/me` | поточний користувач |
| GET, PATCH | `/api/profile` | профіль |
| POST | `/api/profile/password` | зміна пароля |
| GET, POST | `/api/users` | користувачі (адміністратор) |
| GET, PUT, PATCH, DELETE | `/api/users/:id` | один користувач |
| POST | `/api/users/:id/password` | новий згенерований пароль |
| POST | `/api/tickets/:id/pay`, `/check-in`, `/cancel` | дії з квитком |
| GET | `/api/reference/event-form` | локації, категорії, організатори для форми події |
| GET | `/api/reference/form/:resource` | довідники для полів форми |
| GET, POST | `/api/:resource` | список і створення |
| GET, PUT, PATCH, DELETE | `/api/:resource/:id` | один запис |

Ресурси: `events`, `locations`, `organizers`, `categories`, `tickets`, `clients`.

Списки підтримують `limit`, `offset`, `q`, `status`, `city` і фільтри за зв'язками
`event`, `category`, `client`, `organizer`, `location`. Гість бачить лише опубліковані
події; організатор і клієнт бачать лише свої записи.

## База даних

Файли:

- `db/schema.sql` — таблиці, індекси, зовнішні ключі й таблиця сесій;
- `db/seed.sql` — демонстраційні дані та паролі для `pgcrypto`;
- `db/seed.sql` генерується з `src/db/seed/data/*` командою `npm run db:generate`.

Перестворення бази:

```bash
npm run db:reset              # Neon з DATABASE_URL
npm run db:reset -- --local   # локальна PostgreSQL з DB_*
npm run db:reset -- --yes     # без підтвердження
```

Скрипт виконує `schema.sql` і `seed.sql` в одній транзакції. Він видаляє всі таблиці,
тому після нього всі сесії завершуються. Автоматичного сіду під час старту сервера
немає: база готується окремою командою.

## Локальний запуск

```bash
npm install
cp .env.example .env
# заповніть DATABASE_URL і SESSION_SECRET
npm run db:reset -- --yes
npm start
```

Сайт: `http://localhost:4200`.

Для локальної PostgreSQL додайте у `.env` змінні `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, `DB_NAME` і запускайте скидання з `--local`. Для Neon достатньо
`DATABASE_URL` і `DB_SSL=true`.

## Розгортання на Vercel

`api/index.js` експортує Express-застосунок як serverless-функцію, `vercel.json`
спрямовує всі запити на неї. У Vercel потрібно задати:

- `DATABASE_URL` — рядок підключення Neon (pooled);
- `SESSION_SECRET` — довгий випадковий рядок;
- `DB_SSL=true`.

Після першого деплою виконайте `npm run db:reset` локально з production
`DATABASE_URL`, щоб створити схему й демонстраційні дані.

## Структура

```text
api/index.js            Vercel-адаптер
db/schema.sql           схема PostgreSQL
db/seed.sql             демо-дані та bcrypt-хеші через pgcrypto
scripts/reset-db.mjs    скидання бази
scripts/generate-seed.mjs
src/api/                REST API та контроль доступу
src/auth/               Passport, ролі, паролі
src/controller/         контролери сторінок
src/db/                 TypeORM, entity, демо-дані
src/service/            бізнес-логіка
src/view/               Nunjucks-шаблони
src/asset/              CSS, JS, іконки
```
