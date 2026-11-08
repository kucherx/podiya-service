import 'dotenv/config';
import app from './app.js';
import { AppDataSource } from './db/data-source.js';
import { seed } from './db/seed/index.js';

const PORT = Number(process.env.PORT) || 4200;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    const seeded = await seed(AppDataSource);

    if (seeded) {
      console.log('[db] Демонстраційні дані створено');
    }

    app.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log(' Podiya запущено');
      console.log(` Сайт: http://localhost:${PORT}`);
      console.log(` База даних: ${process.env.DATABASE_PATH || 'storage/podiya.sqlite'}`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('Не вдалося запустити застосунок:', error.message);
    process.exit(1);
  }
}

bootstrap();
