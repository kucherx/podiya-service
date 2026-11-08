# Podiya

Платформа івент-менеджменту та продажу квитків на Express.js, TypeORM і SQLite.

## Про проєкт

У проєкті реалізовано модель даних: сутності, зв’язки, схему SQLite та демонстраційне наповнення.

## Стек

- Node.js, ESM
- Express.js
- Handlebars.js (`express-handlebars`)
- TypeORM
- SQLite (драйвер `sql.js`)
- dotenv

## Сутності

- `Location` — локація проведення події.
- `Organizer` — організатор події.
- `Event` — подія з датами, статусом, локацією та організатором.
- `TicketCategory` — категорія квитка в межах події.
- `Client` — клієнт, який купує квитки.
- `Ticket` — квиток на подію з категорією та необов’язковим клієнтом.

Статуси події: `draft`, `published`, `cancelled`, `finished`.  
Статуси квитка: `available`, `reserved`, `sold`, `cancelled`.

## Правила найменування

- Папки — короткі, в однині, нижнім регістром: `db`, `entity`, `seed`, `data`.
- Файли — `kebab-case`: `data-source.js`, `ticket-category.entity.js`.
- Сутності TypeORM — суфікс `.entity.js`.
- Набори демонстраційних даних — суфікс `.data.js`.
- Класи та сутності — `PascalCase`.
- Таблиці SQLite — `snake_case` у множині: `ticket_categories`.
- Змінні середовища — `UPPER_SNAKE_CASE`: `DATABASE_PATH`.

## Запуск

```bash
npm install
npm run db:seed
npm start
```

Після запуску:

- `http://localhost:4200` — HTML-таблиця подій;
- `http://localhost:4200/events` — події;
- `http://localhost:4200/locations` — локації;
- `http://localhost:4200/organizers` — організатори;
- `http://localhost:4200/categories` — категорії квитків;
- `http://localhost:4200/tickets` — квитки;
- `http://localhost:4200/clients` — клієнти;
- `http://localhost:4200/health` — перевірка підключення та кількість записів.

## Структура

```text
src/
  app.js
  server.js
  asset/
    favicon.svg
    main.css
  controller/
    table.controller.js
  view/
    format.js
    navigation.js
    table-config.js
    table.hbs
    layouts/
      main.hbs
  db/
    data-source.js
    entity/
      client.entity.js
      event.entity.js
      location.entity.js
      organizer.entity.js
      ticket.entity.js
      ticket-category.entity.js
      index.js
    seed/
      data/
        clients.data.js
        events.data.js
        locations.data.js
        organizers.data.js
      index.js
      run.js
```

Файл бази даних: `storage/podiya.sqlite`.  
SQL-схема: `schema.sql`.

## Скрипти

- `npm start` — запуск сервера.
- `npm run dev` — запуск із nodemon.
- `npm run db:seed` — наповнення бази демонстраційними даними.
