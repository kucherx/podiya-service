import 'dotenv/config';
import { AppDataSource } from '../data-source.js';
import { seed } from './index.js';

await AppDataSource.initialize();
const seeded = await seed(AppDataSource);

console.log(seeded ? 'Демонстраційні дані створено' : 'База вже містить дані');
await AppDataSource.destroy();
