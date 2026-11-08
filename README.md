# Podiya

Платформа івент-менеджменту та продажу квитків на Express.js, TypeORM, SQLite і Handlebars.js.

## Про проєкт

Реалізовано модель даних, CRUD-форми, серверну валідацію, авторизацію за ролями, захищені маршрути та профіль користувача. Дані зберігаються в SQLite, доступ до них виконується через TypeORM, сторінки рендеряться Handlebars.js.

## Стек

- Node.js, ESM
- Express.js, `express-session`
- Passport.js (`passport-local`)
- Handlebars.js (`express-handlebars`)
- TypeORM, SQLite (`sql.js`)
- `bcryptjs`, `dotenv`

## Ролі та доступ

- **Відвідувач** — неавторизований користувач. Бачить лише опубліковані події; може відкрити модальні вікна входу та реєстрації.
- **Клієнт** — бачить опубліковані події, власні квитки та профіль. Реєстрація створює саме клієнта.
- **Організатор** — бачить і редагує лише власні події та квитки цих подій, має профіль. Не має доступу до локацій, організаторів, категорій і клієнтів.
- **Адміністратор** — має доступ до всіх сутностей і дій.

## Демо-акаунти

- `event.manager.podiya@gmail.com` / `Admin123!` — адміністратор;
- `kyiv.event.yard@gmail.com` / `Organizer123!` — організатор;
- `myroslava.havryliuk@gmail.com` / `Client123!` — клієнт.

## Можливості

- створення й редагування записів через одну універсальну форму;
- категорії квитків глобальні, подія може мати багато категорій;
- автоматична генерація коду квитка;
- перевірка унікальності організаторів і локацій у межах міста;
- серверна валідація та локалізація помилок БД;
- модальне вікно видалення із забороною видалення пов’язаних записів;
- вхід і реєстрація в модальних вікнах лише для неавторизованих;
- зміна особистих даних і пароля в профілі.

## Сутності

- `Location` — локація події.
- `Organizer` — організатор події.
- `Event` — подія з датами, статусом, локацією, організатором і категоріями.
- `TicketCategory` — глобальна категорія квитка.
- `Client` — клієнт, який купує квитки.
- `Ticket` — квиток на подію з категорією та необов’язковим клієнтом.
- `User` — обліковий запис із роллю `admin`, `organizer` або `client`.

## Запуск

```bash
npm install
npm run db:seed
npm start
```

Сайт: `http://localhost:4200`.

Для сесій використовується `SESSION_SECRET` (див. `.env.example`).

## Маршрути

- `GET /`, `GET /events` — список подій;
- `GET /tickets` — квитки з урахуванням ролі;
- `GET /profile` — профіль авторизованого користувача;
- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`;
- `GET /locations`, `/organizers`, `/categories`, `/clients` — лише адміністратор;
- CRUD-маршрути `/events` і `/tickets` — адміністратор і організатор;
- `GET /api/:resource/:id/related` — дані для модального вікна видалення;
- `GET /health` — перевірка бази даних.

## Структура

```text
src/
  app.js, server.js
  auth/           roles.js, passwords.js, access.js, passport.js,
                  middleware.js, user-view.js
  controller/     table.js, form.js, record.js, auth.js, profile.js
  db/             data-source.js
    entity/       client.js, event.js, location.js, organizer.js,
                  ticket-category.js, ticket.js, user.js, index.js
    seed/         index.js, run.js
      data/       clients.js, events.js, locations.js, organizers.js,
                  categories.js, users.js
  lib/            messages.js
  service/        form-fields.js, relations.js, ticket-code.js
  validation/     validate.js, values.js, unique.js, db-errors.js
  view/           table.hbs, form.hbs, profile.hbs, error.hbs,
                  table-config.js, format.js, navigation.js,
                  forms/ (events, locations, organizers, categories,
                  tickets, clients, index), layouts/main.hbs,
                  partials/ (delete-modal.hbs, auth-modals.hbs, icons.hbs)
  asset/
    css/          base, nav, header, controls, table, form, multi-select,
                  hints, stepper, select, date, calendar, calendar-footer,
                  modal, auth, profile
    js/           select, multi-select, phone-hint, date-utils, date-picker,
                  stepper, modal, auth
```

Файл бази даних: `storage/podiya.sqlite`. SQL-схема: `schema.sql`.

## Скрипти

- `npm start` — запуск сервера.
- `npm run dev` — запуск із nodemon.
- `npm run db:seed` — наповнення бази демонстраційними даними.
