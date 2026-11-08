import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { entities } from './entity/index.js';

const databasePath = path.resolve(process.env.DATABASE_PATH || 'storage/podiya.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const AppDataSource = new DataSource({
  type: 'sqljs',
  location: databasePath,
  autoSave: true,
  entities,
  synchronize: true,
  logging: false
});
