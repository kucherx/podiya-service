# Podiya

Платформа івент-менеджменту та продажу квитків на Express.js, TypeORM, SQLite і Handlebars.js.

## Про проєкт

Реалізовано модель даних, серверні контролери, HTML-представлення та CRUD-форми для всіх сутностей. Дані зберігаються в SQLite, доступ до них виконується через TypeORM, а сторінки рендеряться шаблонізатором Handlebars.js.

## Стек

- Node.js, ESM
- Express.js
- Handlebars.js (`express-handlebars`)
- TypeORM
- SQLite (драйвер `sql.js`)
- dotenv

## Можливості

- перегляд таблиць для всіх сутностей;
- створення й редагування записів через одну універсальну форму;
- категорії квитків є глобальними, подія може мати багато категорій;
- автоматична генерація коду квитка;
- перевірка унікальності організаторів і локацій у межах міста;
- серверна валідація полів із локалізованими повідомленнями;
- локалізація помилок бази даних;
- модальне вікно підтвердження видалення;
- заборона видалення записів, із якими пов’язані інші записи;
- кастомні випадаючі списки, поля дати й числові лічильники.

## Сутності

- `Location` — локація проведення події.
- `Organizer` — організатор події.
- `Event` — подія з датами, статусом, локацією та організатором.
- `TicketCategory` — глобальна категорія квитка; подія може мати багато категорій.
- `Client` — клієнт, який купує квитки.
- `Ticket` — квиток на подію з категорією та необов’язковим клієнтом.

Статуси події: `draft`, `published`, `cancelled`, `finished`.  
Статуси квитка: `available`, `reserved`, `sold`, `cancelled`.

## Запуск

```bash
npm install
npm run db:seed
npm start
```

## Маршрути

- `GET /` — таблиця подій;
- `GET /events` — події;
- `GET /locations` — локації;
- `GET /organizers` — організатори;
- `GET /categories` — категорії квитків;
- `GET /tickets` — квитки;
- `GET /clients` — клієнти.

Для кожної сутності також доступні:

- `GET /<ресурс>/new` — форма створення;
- `GET /<ресурс>/:id/edit` — форма редагування;
- `POST /<ресурс>` — створення запису;
- `POST /<ресурс>/:id` — оновлення запису;
- `POST /<ресурс>/:id/delete` — видалення запису.

Службові маршрути:

- `GET /health` — перевірка підключення та кількість записів;
- `GET /api/<ресурс>/:id/related` — кількість пов’язаних записів для модального вікна.

## Структура

```text
src/
  app.js
  server.js
  asset/
    favicon.svg
    css/
      base.css, nav.css, controls.css, table.css, form.css, multi-select.css,
      hints.css, stepper.css, select.css, date.css, calendar.css,
      calendar-footer.css, modal.css
    js/
      select.js, multi-select.js, phone-hint.js, date-utils.js, date-picker.js,
      stepper.js, modal.js
  controller/
    table.js
    form.js
    record.js
  db/
    data-source.js
    entity/
      client.js
      event.js
      location.js
      organizer.js
      ticket-category.js
      ticket.js
      index.js
    seed/
      data/
        clients.js, events.js, locations.js, organizers.js, categories.js
      index.js
      run.js
  lib/
    messages.js
  service/
    form-fields.js
    relations.js
    ticket-code.js
  validation/
    validate.js
    values.js
    unique.js
    db-errors.js
  view/
    table.hbs
    form.hbs
    error.hbs
    table-config.js
    format.js
    navigation.js
    forms/
      events.js
      locations.js
      organizers.js
      categories.js
      tickets.js
      clients.js
      index.js
    layouts/
      main.hbs
    partials/
      delete-modal.hbs
      icons.hbs
```

Файл бази даних: `storage/podiya.sqlite`.  
SQL-схема: `schema.sql`.

## Скрипти

- `npm start` — запуск сервера.
- `npm run dev` — запуск із nodemon.
- `npm run db:seed` — наповнення бази демонстраційними даними.
