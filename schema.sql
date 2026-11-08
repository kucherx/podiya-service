CREATE TABLE "locations" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(160) NOT NULL, "city" varchar(100) NOT NULL, "address" varchar(255) NOT NULL, "capacity" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_c990a6fac97a9b8b741e869e05e" UNIQUE ("name", "city"));

CREATE INDEX "IDX_f1a9093eafe4afa3a5ee8ca096" ON "locations" ("city");

CREATE TABLE "organizers" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(160) NOT NULL, "city" varchar(100) NOT NULL, "email" varchar(160) NOT NULL, "phone" varchar(32) NOT NULL, "website" varchar(255), "description" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_8397cb03df8e578b59c591d9147" UNIQUE ("email"), CONSTRAINT "UQ_edf349576e40a1ed2a3b3539354" UNIQUE ("city", "name"));

CREATE TABLE "clients" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fullName" varchar(160) NOT NULL, "email" varchar(160) NOT NULL, "phone" varchar(32) NOT NULL, "city" varchar(100) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email"));

CREATE INDEX "IDX_396b6ec49a8f3cae7cdc6e866d" ON "clients" ("city");

CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar(160) NOT NULL, "passwordHash" varchar(255) NOT NULL, "role" varchar(20) NOT NULL DEFAULT ('client'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "client_id" integer, "organizer_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "FK_0d1e90d75674c54f8660c4ed446" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ef810b89dd19a7a7dc5fc687880" FOREIGN KEY ("organizer_id") REFERENCES "organizers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION);

CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role");

CREATE TABLE "events" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(200) NOT NULL, "description" text NOT NULL, "startsAt" datetime NOT NULL, "endsAt" datetime NOT NULL, "status" varchar(32) NOT NULL DEFAULT ('draft'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "location_id" integer NOT NULL, "organizer_id" integer NOT NULL, CONSTRAINT "FK_fccf31c64ec14a66276e9999730" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e" FOREIGN KEY ("organizer_id") REFERENCES "organizers" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION);

CREATE INDEX "IDX_e0da647c004a695b1d55a073e8" ON "events" ("startsAt");

CREATE INDEX "IDX_03dcebc1ab44daa177ae9479c4" ON "events" ("status");

CREATE TABLE "ticket_categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(120) NOT NULL, "description" text, "price" real NOT NULL, "quantity" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_f8352319da7b191189b1001ba27" UNIQUE ("name"));

CREATE TABLE "tickets" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "code" varchar(32) NOT NULL, "status" varchar(32) NOT NULL DEFAULT ('available'), "price" real NOT NULL, "purchasedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "event_id" integer NOT NULL, "category_id" integer NOT NULL, "client_id" integer, CONSTRAINT "UQ_c6e20a830c0f8b571abd331b775" UNIQUE ("code"), CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_32a7f0e4e32a46a094b55f7c25c" FOREIGN KEY ("category_id") REFERENCES "ticket_categories" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ab0f4c7161f0a5c178d229e3541" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE NO ACTION);

CREATE INDEX "IDX_bd5387c23fb40ae7e3526ad75e" ON "tickets" ("event_id");

CREATE INDEX "IDX_12b901b34113688b4786368510" ON "tickets" ("status");

CREATE TABLE "event_categories" ("event_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "FK_c78c7b670b392b79ee76f01b675" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_372a350b878524310e04d0ddec2" FOREIGN KEY ("category_id") REFERENCES "ticket_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("event_id", "category_id"));

CREATE INDEX "IDX_c78c7b670b392b79ee76f01b67" ON "event_categories" ("event_id");

CREATE INDEX "IDX_372a350b878524310e04d0ddec" ON "event_categories" ("category_id");
