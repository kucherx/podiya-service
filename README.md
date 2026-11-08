# Podiya

Платформа івент-менеджменту та продажу квитків на Express.js, TypeORM, SQLite і Handlebars.js.

## Про проєкт

Реалізовано модель даних, CRUD-форми, серверну валідацію, авторизацію за ролями, захищені маршрути та профіль користувача. Дані зберігаються в SQLite, доступ до них виконується через TypeORM, сторінки рендеряться Handlebars.js. Усі дані на сторінках — списки, деталі, форми, профіль, користувачі, авторизація та дії з квитками — отримуються й змінюються через REST API.

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
- **Адміністратор** — має доступ до всіх сутностей і дій, керує користувачами та їхніми ролями.

## Адмін-функції

- створення акаунтів із ролями `admin`, `organizer`, `client`;
- прив’язка організатора або клієнта до акаунта;
- редагування та видалення користувачів;
- скидання пароля з генерацією нового та копіюванням у модальному вікні.

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
- зміна особистих даних і пароля в профілі;
- перегляд деталей події та купівля кількох квитків одним замовленням;
- підтвердження оплати й відмітка присутності організатором;
- RESTful API для всіх сутностей із рольовим обмеженням вибірки.

## REST API

Базовий шлях: `http://localhost:4200/api`.

Автентифікація виконується через сесію Passport: спочатку увійдіть на сайті, після чого захищені ресурси доступні за посиланнями в браузері або через cookie-сесію.

| Метод | Шлях | Опис |
| --- | --- | --- |
| GET | `/api` | індекс ресурсів і можливих запитів |
| POST | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` | вхід, реєстрація, вихід |
| GET | `/api/auth/me` | поточний користувач |
| GET, PATCH | `/api/profile` | перегляд і оновлення профілю |
| POST | `/api/profile/password` | зміна пароля |
| GET, POST | `/api/users` | список і створення користувачів |
| GET, PUT, PATCH, DELETE | `/api/users/:id` | перегляд, оновлення й видалення користувача |
| POST | `/api/users/:id/password` | генерація нового пароля |
| POST | `/api/tickets/:id/pay`, `/check-in`, `/cancel` | оплата, присутність, скасування |
| GET | `/api/reference/event-form` | локації та категорії для форми події |
| GET | `/api/reference/form/:resource` | довідники для полів форми |
| GET | `/api/:resource` | список записів |
| GET | `/api/:resource/:id` | один запис |
| POST | `/api/:resource` | створити запис |
| PUT, PATCH | `/api/:resource/:id` | оновити запис |
| DELETE | `/api/:resource/:id` | видалити запис |

Ресурси: `events`, `locations`, `organizers`, `categories`, `tickets`, `clients`.

Для списків підтримуються `limit`, `offset`, `q`, `status`, `city`, а також фільтри за зв’язками `event`, `category`, `client`, `organizer`, `location`.

Доступ до даних:

- гість бачить лише опубліковані події;
- клієнт бачить опубліковані події та власні квитки;
- організатор бачить власні події й квитки цих подій;
- адміністратор має повний доступ до всіх ресурсів.

Локації, організатори, категорії квитків, клієнти й користувачі доступні лише адміністратору. Для форми події адміністратор і організатор окремо отримують довідники через `/api/reference/event-form`. Спроба відкрити чужий запис повертає `403`. Видалення запису з пов’язаними даними повертає `409`.

## Сутності

- `Location` — локація події.
- `Organizer` — організатор події.
- `Event` — подія з датами, статусом, локацією, організатором і категоріями.
- `TicketCategory` — глобальна категорія квитка.
- `Client` — клієнт, який купує квитки.
- `Ticket` — замовлення на один або кілька квитків певної категорії з необов’язковим клієнтом.
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
- `GET /events/:id` — сторінка деталей події; дані завантажуються через `/api/events/:id` і `/api/tickets`;
- `GET /tickets` — квитки з урахуванням ролі;
- `GET /users` — керування користувачами (адміністратор);
- `GET /profile` — профіль авторизованого користувача;
- `GET /locations`, `/organizers`, `/categories`, `/clients` — лише адміністратор;
- `GET /api` — індекс REST API;
- `POST /api/auth/login`, `/api/auth/register`, `/api/auth/logout` — авторизація;
- `GET /api/auth/me` — поточний користувач;
- `GET/PATCH /api/profile`, `POST /api/profile/password` — профіль;
- CRUD-маршрути `/api/users` — лише адміністратор;
- `POST /api/tickets/:id/pay`, `/check-in`, `/cancel` — дії з квитками;
- `GET /api/reference/event-form`, `/api/reference/form/:resource` — довідники для форм;
- `GET/POST /api/:resource`, `GET/PUT/PATCH/DELETE /api/:resource/:id` — REST API;
- `GET /api/:resource/:id/related` — дані для модального вікна видалення;
- `GET /health` — перевірка бази даних.

## Структура

```text
src/
  app.js, server.js
  api/            resources.js, access.js, helpers.js, rules.js, router.js,
                  controllers/ (index, read, create, update, remove, auth,
                  profile, users, tickets, reference)
  auth/           roles.js, passwords.js, access.js, passport.js,
                  middleware.js, user-view.js
  controller/     table.js, form.js, record.js, profile.js,
                  admin-user.js, admin-user-form.js, event.js
  db/             data-source.js
    entity/       client.js, event.js, location.js, organizer.js,
                  ticket-category.js, ticket.js, user.js, index.js
    seed/         index.js, run.js
      data/       clients.js, events.js, locations.js, organizers.js,
                  categories.js, users.js
  lib/            messages.js, render-error.js
  service/        form-config.js, form-fields.js, relations.js, ticket-code.js,
                  ticket-stock.js, admin-users.js
  validation/     validate.js, values.js, unique.js, db-errors.js
  view/           table.hbs, form.hbs, profile.hbs, users.hbs, user-form.hbs,
                  event.hbs, error.hbs, table-config.js, format.js, navigation.js,
                  forms/ (events, locations, organizers, categories,
                  tickets, clients, index), layouts/main.hbs,
                  partials/ (delete-modal.hbs, auth-modals.hbs, password-modal.hbs, icons.hbs)
  asset/
    css/          base, nav, header, controls, table, form, multi-select,
                  hints, stepper, select, date, calendar, calendar-footer,
                  modal, auth, profile, password, event, event-buy, event-tickets
    js/           select, multi-select, phone-hint, date-utils, date-picker,
                  stepper, modal, auth, ajax, page-swap, form-feedback,
                  password-modal, user-form, form-page, table-page, users-page,
                  event-view, event-page, profile-page, row-link
```

Файл бази даних: `storage/podiya.sqlite`. SQL-схема: `schema.sql`.

## Скрипти

- `npm start` — запуск сервера.
- `npm run dev` — запуск із nodemon.
- `npm run db:seed` — наповнення бази демонстраційними даними.
