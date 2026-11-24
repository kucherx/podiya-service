-- Podiya — демонстраційні дані для PostgreSQL
-- Паролі в цьому файлі наведені у відкритому вигляді.
-- У базу вони потрапляють уже як bcrypt-хеші завдяки pgcrypto crypt().
-- Після виконання schema.sql цей файл можна запускати повторно.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Локації
INSERT INTO "locations" ("name", "city", "address", "capacity") VALUES ('Простір «Арсенал»', 'Київ', 'вул. Івана Мазепи, 24', 600);
INSERT INTO "locations" ("name", "city", "address", "capacity") VALUES ('Двір Львівської опери', 'Львів', 'просп. Свободи, 28', 450);
INSERT INTO "locations" ("name", "city", "address", "capacity") VALUES ('Dnipro Creative Hub', 'Дніпро', 'вул. Харківська, 5', 300);
INSERT INTO "locations" ("name", "city", "address", "capacity") VALUES ('Odesa Film Studio', 'Одеса', 'Французький бульвар, 33', 250);
INSERT INTO "locations" ("name", "city", "address", "capacity") VALUES ('Харківський літературний музей', 'Харків', 'вул. Багалія, 6', 180);

-- Організатори
INSERT INTO "organizers" ("name", "city", "email", "phone", "website", "description") VALUES ('Київський подієвий двір', 'Київ', 'kyiv.event.yard@gmail.com', '+380 44 217 43 59', 'https://kyiv-event-yard.com', 'Організація міських концертів, виставок і культурних вечорів.');
INSERT INTO "organizers" ("name", "city", "email", "phone", "website", "description") VALUES ('Львівська сцена', 'Львів', 'lvivska.stsena@gmail.com', '+380 32 245 18 73', 'https://lvivska-stsena.com', 'Театральні, музичні та літературні події Львова.');
INSERT INTO "organizers" ("name", "city", "email", "phone", "website", "description") VALUES ('Дніпро Подія', 'Дніпро', 'dnipro.podiya@gmail.com', '+380 56 731 26 48', 'https://dnipro-podiya.com', 'Креативні події, виставки та освітні проєкти.');
INSERT INTO "organizers" ("name", "city", "email", "phone", "website", "description") VALUES ('Одеський івент-хаб', 'Одеса', 'odesa.event.hub@gmail.com', '+380 48 726 54 19', 'https://odesa-event-hub.com', 'Музичні вечори, кінопокази та міські фестивалі.');
INSERT INTO "organizers" ("name", "city", "email", "phone", "website", "description") VALUES ('Харків Культ', 'Харків', 'kharkiv.kult@gmail.com', '+380 57 715 39 62', 'https://kharkiv-kult.com', 'Сучасна музика, лекції та мистецькі зустрічі.');

-- Клієнти
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Мирослава Гаврилюк', 'myroslava.havryliuk@gmail.com', '+380 67 214 35 46', 'Київ');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Артем Литвиненко', 'artem.lytvynenko@gmail.com', '+380 63 325 46 57', 'Львів');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Дарина Бондаренко', 'daryna.bondarenko@gmail.com', '+380 50 436 57 68', 'Одеса');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Олексій Ткаченко', 'oleksii.tkachenko@gmail.com', '+380 96 547 68 79', 'Дніпро');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Марія Кравченко', 'maria.kravchenko@gmail.com', '+380 67 658 79 80', 'Харків');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Ігор Мельник', 'ihor.melnyk@gmail.com', '+380 68 769 80 91', 'Київ');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Юлія Поліщук', 'yuliia.polishchuk@gmail.com', '+380 95 870 91 02', 'Львів');
INSERT INTO "clients" ("fullName", "email", "phone", "city") VALUES ('Максим Лисенко', 'maksym.lysenko@gmail.com', '+380 93 981 02 13', 'Одеса');

-- Категорії квитків
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Стандарт', 'Базовий квиток на подію.', 450, 120);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Преміум', 'Квиток із розширеними умовами.', 750, 60);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('VIP', 'VIP-зона та окремий вхід.', 1200, 24);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Студентський', 'Пільговий квиток для студентів.', 180, 80);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Денний', 'Відвідування виставки вдень.', 250, 300);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Повний', 'Повний доступ до всіх зон.', 400, 150);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Екскурсія', 'Квиток із супроводом екскурсовода.', 600, 40);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Передній ряд', 'Місця в першому ряду.', 700, 30);
INSERT INTO "ticket_categories" ("name", "description", "price", "quantity") VALUES ('Бізнес', 'Бізнес-зона та нетворкінг.', 900, 100);

-- Події
INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES ('Ніч електронної музики', 'Живі сети, візуальні інсталяції та лекторій про сучасну електронну сцену.', '2026-12-12 19:00:00+02:00', '2026-12-12 23:00:00+02:00', 'published', 1, 1);
INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES ('Фестиваль незалежного кіно', 'Покази короткого метру, зустрічі з режисерами та дискусії про монтаж.', '2027-01-18 18:00:00+02:00', '2027-01-18 22:00:00+02:00', 'published', 2, 2);
INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES ('Виставка «Місто в деталях»', 'Архітектурна графіка, макети та аудіогід від дослідників міста.', '2027-02-06 11:00:00+02:00', '2027-02-06 20:00:00+02:00', 'published', 3, 3);
INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES ('Літературний вечір «Тиша»', 'Читання нових текстів, розмова про місто і живий сет від запрошених музикантів.', '2027-02-21 19:00:00+02:00', '2027-02-21 21:00:00+02:00', 'published', 5, 5);
INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES ('Stand-up: Нові обличчя', 'Вечір нових коміків із короткими сетами та гостьовим ведучим.', '2027-03-05 20:00:00+02:00', '2027-03-05 22:30:00+02:00', 'draft', 1, 1);
INSERT INTO "events" ("title", "description", "startsAt", "endsAt", "status", "location_id", "organizer_id") VALUES ('Форум креативних індустрій', 'Панелі про дизайн, продюсування подій, партнерства та міські культурні проєкти.', '2027-03-20 10:00:00+02:00', '2027-03-20 18:00:00+02:00', 'draft', 4, 4);

-- Зв’язки подія ↔ категорія
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (1, 1);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (1, 2);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (1, 3);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (2, 1);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (2, 4);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (2, 2);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (3, 5);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (3, 6);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (3, 7);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (4, 1);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (4, 2);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (4, 3);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (5, 1);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (5, 8);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (5, 4);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (6, 1);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (6, 9);
INSERT INTO "event_categories" ("event_id", "category_id") VALUES (6, 4);

-- Квитки: по три на кожну категорію події
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-01-01', 'sold', 450, 1, '2026-11-10 12:00:00+02:00', '2026-11-10 13:00:00+02:00', '2026-11-12 18:00:00+02:00', 1, 1, 1);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-01-02', 'available', 450, 1, NULL, NULL, NULL, 1, 1, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-01-03', 'reserved', 450, 1, NULL, NULL, NULL, 1, 1, 1);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-02-01', 'sold', 750, 1, '2026-11-10 12:00:00+02:00', '2026-11-10 13:00:00+02:00', '2026-11-12 18:00:00+02:00', 1, 2, 2);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-02-02', 'available', 750, 1, NULL, NULL, NULL, 1, 2, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-02-03', 'reserved', 750, 1, NULL, NULL, NULL, 1, 2, 2);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-03-01', 'sold', 1200, 1, '2026-11-10 12:00:00+02:00', '2026-11-10 13:00:00+02:00', '2026-11-12 18:00:00+02:00', 1, 3, 3);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-03-02', 'available', 1200, 1, NULL, NULL, NULL, 1, 3, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-01-03-03', 'reserved', 1200, 1, NULL, NULL, NULL, 1, 3, 3);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-01-01', 'sold', 450, 1, '2026-11-11 12:00:00+02:00', '2026-11-11 13:00:00+02:00', '2026-11-13 18:00:00+02:00', 2, 1, 2);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-01-02', 'available', 450, 1, NULL, NULL, NULL, 2, 1, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-01-03', 'reserved', 450, 1, NULL, NULL, NULL, 2, 1, 2);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-02-01', 'sold', 180, 1, '2026-11-11 12:00:00+02:00', '2026-11-11 13:00:00+02:00', '2026-11-13 18:00:00+02:00', 2, 4, 3);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-02-02', 'available', 180, 1, NULL, NULL, NULL, 2, 4, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-02-03', 'reserved', 180, 1, NULL, NULL, NULL, 2, 4, 3);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-03-01', 'sold', 750, 1, '2026-11-11 12:00:00+02:00', '2026-11-11 13:00:00+02:00', '2026-11-13 18:00:00+02:00', 2, 2, 4);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-03-02', 'available', 750, 1, NULL, NULL, NULL, 2, 2, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-02-03-03', 'reserved', 750, 1, NULL, NULL, NULL, 2, 2, 4);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-01-01', 'sold', 250, 1, '2026-11-12 12:00:00+02:00', '2026-11-12 13:00:00+02:00', '2026-11-14 18:00:00+02:00', 3, 5, 3);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-01-02', 'available', 250, 1, NULL, NULL, NULL, 3, 5, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-01-03', 'reserved', 250, 1, NULL, NULL, NULL, 3, 5, 3);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-02-01', 'sold', 400, 1, '2026-11-12 12:00:00+02:00', '2026-11-12 13:00:00+02:00', '2026-11-14 18:00:00+02:00', 3, 6, 4);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-02-02', 'available', 400, 1, NULL, NULL, NULL, 3, 6, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-02-03', 'reserved', 400, 1, NULL, NULL, NULL, 3, 6, 4);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-03-01', 'sold', 600, 1, '2026-11-12 12:00:00+02:00', '2026-11-12 13:00:00+02:00', '2026-11-14 18:00:00+02:00', 3, 7, 5);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-03-02', 'available', 600, 1, NULL, NULL, NULL, 3, 7, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-03-03-03', 'reserved', 600, 1, NULL, NULL, NULL, 3, 7, 5);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-01-01', 'sold', 450, 1, '2026-11-13 12:00:00+02:00', '2026-11-13 13:00:00+02:00', '2026-11-15 18:00:00+02:00', 4, 1, 4);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-01-02', 'available', 450, 1, NULL, NULL, NULL, 4, 1, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-01-03', 'reserved', 450, 1, NULL, NULL, NULL, 4, 1, 4);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-02-01', 'sold', 750, 1, '2026-11-13 12:00:00+02:00', '2026-11-13 13:00:00+02:00', '2026-11-15 18:00:00+02:00', 4, 2, 5);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-02-02', 'available', 750, 1, NULL, NULL, NULL, 4, 2, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-02-03', 'reserved', 750, 1, NULL, NULL, NULL, 4, 2, 5);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-03-01', 'sold', 1200, 1, '2026-11-13 12:00:00+02:00', '2026-11-13 13:00:00+02:00', '2026-11-15 18:00:00+02:00', 4, 3, 6);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-03-02', 'available', 1200, 1, NULL, NULL, NULL, 4, 3, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-04-03-03', 'reserved', 1200, 1, NULL, NULL, NULL, 4, 3, 6);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-01-01', 'sold', 450, 1, '2026-11-14 12:00:00+02:00', '2026-11-14 13:00:00+02:00', '2026-11-16 18:00:00+02:00', 5, 1, 5);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-01-02', 'available', 450, 1, NULL, NULL, NULL, 5, 1, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-01-03', 'reserved', 450, 1, NULL, NULL, NULL, 5, 1, 5);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-02-01', 'sold', 700, 1, '2026-11-14 12:00:00+02:00', '2026-11-14 13:00:00+02:00', '2026-11-16 18:00:00+02:00', 5, 8, 6);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-02-02', 'available', 700, 1, NULL, NULL, NULL, 5, 8, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-02-03', 'reserved', 700, 1, NULL, NULL, NULL, 5, 8, 6);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-03-01', 'sold', 180, 1, '2026-11-14 12:00:00+02:00', '2026-11-14 13:00:00+02:00', '2026-11-16 18:00:00+02:00', 5, 4, 7);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-03-02', 'available', 180, 1, NULL, NULL, NULL, 5, 4, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-05-03-03', 'reserved', 180, 1, NULL, NULL, NULL, 5, 4, 7);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-01-01', 'sold', 450, 1, '2026-11-15 12:00:00+02:00', '2026-11-15 13:00:00+02:00', '2026-11-17 18:00:00+02:00', 6, 1, 6);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-01-02', 'available', 450, 1, NULL, NULL, NULL, 6, 1, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-01-03', 'reserved', 450, 1, NULL, NULL, NULL, 6, 1, 6);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-02-01', 'sold', 900, 1, '2026-11-15 12:00:00+02:00', '2026-11-15 13:00:00+02:00', '2026-11-17 18:00:00+02:00', 6, 9, 7);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-02-02', 'available', 900, 1, NULL, NULL, NULL, 6, 9, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-02-03', 'reserved', 900, 1, NULL, NULL, NULL, 6, 9, 7);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-03-01', 'sold', 180, 1, '2026-11-15 12:00:00+02:00', '2026-11-15 13:00:00+02:00', '2026-11-17 18:00:00+02:00', 6, 4, 8);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-03-02', 'available', 180, 1, NULL, NULL, NULL, 6, 4, NULL);
INSERT INTO "tickets" ("code", "status", "price", "quantity", "purchasedAt", "paidAt", "checkedInAt", "event_id", "category_id", "client_id") VALUES ('POD-06-03-03', 'reserved', 180, 1, NULL, NULL, NULL, 6, 4, 8);

-- Користувачі. Кожен акаунт має власний 20-символьний пароль.
-- У базу пароль потрапляє як bcrypt-хеш через pgcrypto crypt().
INSERT INTO "users" ("email", "passwordHash", "role") VALUES ('event.manager.podiya@gmail.com', crypt('@C/^"JMGn97v"Eb+?1WV', gen_salt('bf', 12)), 'admin');
INSERT INTO "users" ("email", "passwordHash", "role", "organizer_id") VALUES ('kyiv.event.yard@gmail.com', crypt('+B8Hz=P",H<.N!:T~Vp*', gen_salt('bf', 12)), 'organizer', 1);
INSERT INTO "users" ("email", "passwordHash", "role", "organizer_id") VALUES ('lvivska.stsena@gmail.com', crypt('ZXS{{vTT@$C/(X>VU3X!', gen_salt('bf', 12)), 'organizer', 2);
INSERT INTO "users" ("email", "passwordHash", "role", "organizer_id") VALUES ('dnipro.podiya@gmail.com', crypt('Q~5E8)S&mn~BzytntKKd', gen_salt('bf', 12)), 'organizer', 3);
INSERT INTO "users" ("email", "passwordHash", "role", "organizer_id") VALUES ('odesa.event.hub@gmail.com', crypt('B**chZZpWxHYGF$@6Ax_', gen_salt('bf', 12)), 'organizer', 4);
INSERT INTO "users" ("email", "passwordHash", "role", "organizer_id") VALUES ('kharkiv.kult@gmail.com', crypt('aEAZ7d{}:4Tz~knKW}[J', gen_salt('bf', 12)), 'organizer', 5);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('myroslava.havryliuk@gmail.com', crypt('pxDM4]$::fhRhU7ww@BM', gen_salt('bf', 12)), 'client', 1);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('artem.lytvynenko@gmail.com', crypt('):Z;wrRDn6*!Cz%DDK#k', gen_salt('bf', 12)), 'client', 2);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('daryna.bondarenko@gmail.com', crypt('TKU#($m3gP5!.JMeMn<[', gen_salt('bf', 12)), 'client', 3);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('oleksii.tkachenko@gmail.com', crypt('NR7n+#b?WBuK5V]$r>/p', gen_salt('bf', 12)), 'client', 4);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('maria.kravchenko@gmail.com', crypt('gkG*Afv1p847bymD@rwU', gen_salt('bf', 12)), 'client', 5);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('ihor.melnyk@gmail.com', crypt('Xnxr*Hh=h<JeA7G??c7X', gen_salt('bf', 12)), 'client', 6);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('yuliia.polishchuk@gmail.com', crypt('77V!:7"uUyv)<tzc@)#U', gen_salt('bf', 12)), 'client', 7);
INSERT INTO "users" ("email", "passwordHash", "role", "client_id") VALUES ('maksym.lysenko@gmail.com', crypt('>%d&/r.fhNGbHD8PuJXk', gen_salt('bf', 12)), 'client', 8);

-- Послідовності після явних id
SELECT setval(pg_get_serial_sequence('"locations"', 'id'), COALESCE((SELECT MAX("id") FROM "locations"), 1), true);
SELECT setval(pg_get_serial_sequence('"organizers"', 'id'), COALESCE((SELECT MAX("id") FROM "organizers"), 1), true);
SELECT setval(pg_get_serial_sequence('"clients"', 'id'), COALESCE((SELECT MAX("id") FROM "clients"), 1), true);
SELECT setval(pg_get_serial_sequence('"ticket_categories"', 'id'), COALESCE((SELECT MAX("id") FROM "ticket_categories"), 1), true);
SELECT setval(pg_get_serial_sequence('"events"', 'id'), COALESCE((SELECT MAX("id") FROM "events"), 1), true);
SELECT setval(pg_get_serial_sequence('"tickets"', 'id'), COALESCE((SELECT MAX("id") FROM "tickets"), 1), true);
SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX("id") FROM "users"), 1), true);
