-- Podiya — схема PostgreSQL (Neon)
-- Виконується перед seed.sql. Скрипт скидає попередні таблиці.

DROP TABLE IF EXISTS "user_sessions" CASCADE;
DROP TABLE IF EXISTS "event_categories" CASCADE;
DROP TABLE IF EXISTS "tickets" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "organizers" CASCADE;
DROP TABLE IF EXISTS "locations" CASCADE;
DROP TABLE IF EXISTS "ticket_categories" CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "locations" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(160) NOT NULL,
  "city" varchar(100) NOT NULL,
  "address" varchar(255) NOT NULL,
  "capacity" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_locations_name_city" UNIQUE ("name", "city")
);

CREATE INDEX "IDX_locations_city" ON "locations" ("city");

CREATE TABLE "organizers" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(160) NOT NULL,
  "city" varchar(100) NOT NULL,
  "email" varchar(160) NOT NULL,
  "phone" varchar(32) NOT NULL,
  "website" varchar(255),
  "description" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_organizers_email" UNIQUE ("email"),
  CONSTRAINT "UQ_organizers_city_name" UNIQUE ("city", "name")
);

CREATE TABLE "clients" (
  "id" SERIAL PRIMARY KEY,
  "fullName" varchar(160) NOT NULL,
  "email" varchar(160) NOT NULL,
  "phone" varchar(32) NOT NULL,
  "city" varchar(100) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_clients_email" UNIQUE ("email")
);

CREATE INDEX "IDX_clients_city" ON "clients" ("city");

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar(160) NOT NULL,
  "passwordHash" varchar(255) NOT NULL,
  "role" varchar(20) NOT NULL DEFAULT 'client',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "client_id" integer,
  "organizer_id" integer,
  CONSTRAINT "UQ_users_email" UNIQUE ("email"),
  CONSTRAINT "FK_users_client" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_users_organizer" FOREIGN KEY ("organizer_id") REFERENCES "organizers" ("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_users_role" ON "users" ("role");

CREATE TABLE "ticket_categories" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "description" text,
  "price" real NOT NULL,
  "quantity" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_ticket_categories_name" UNIQUE ("name")
);

CREATE TABLE "events" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar(200) NOT NULL,
  "description" text NOT NULL,
  "startsAt" timestamptz NOT NULL,
  "endsAt" timestamptz NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'draft',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "location_id" integer NOT NULL,
  "organizer_id" integer NOT NULL,
  CONSTRAINT "FK_events_location" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE RESTRICT,
  CONSTRAINT "FK_events_organizer" FOREIGN KEY ("organizer_id") REFERENCES "organizers" ("id") ON DELETE RESTRICT
);

CREATE INDEX "IDX_events_startsAt" ON "events" ("startsAt");
CREATE INDEX "IDX_events_status" ON "events" ("status");

CREATE TABLE "event_categories" (
  "event_id" integer NOT NULL,
  "category_id" integer NOT NULL,
  PRIMARY KEY ("event_id", "category_id"),
  CONSTRAINT "FK_event_categories_event" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_event_categories_category" FOREIGN KEY ("category_id") REFERENCES "ticket_categories" ("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_event_categories_event" ON "event_categories" ("event_id");
CREATE INDEX "IDX_event_categories_category" ON "event_categories" ("category_id");

CREATE TABLE "tickets" (
  "id" SERIAL PRIMARY KEY,
  "code" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'available',
  "price" real NOT NULL,
  "quantity" integer NOT NULL DEFAULT 1,
  "purchasedAt" timestamptz,
  "paidAt" timestamptz,
  "checkedInAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "event_id" integer NOT NULL,
  "category_id" integer NOT NULL,
  "client_id" integer,
  CONSTRAINT "UQ_tickets_code" UNIQUE ("code"),
  CONSTRAINT "FK_tickets_event" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_tickets_category" FOREIGN KEY ("category_id") REFERENCES "ticket_categories" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_tickets_client" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_tickets_event" ON "tickets" ("event_id");
CREATE INDEX "IDX_tickets_status" ON "tickets" ("status");

CREATE TABLE "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);

CREATE INDEX "IDX_user_sessions_expire" ON "user_sessions" ("expire");
