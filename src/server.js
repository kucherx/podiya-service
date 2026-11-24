import 'dotenv/config';
import app from './app.js';
import { ensureDb } from './db/bootstrap.js';

const PORT = Number(process.env.PORT) || 4200;

async function bootstrap() {
  try {
    await ensureDb();

    app.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log(' Podiya запущено');
      console.log(` Сайт: http://localhost:${PORT}`);
      console.log(' База даних: PostgreSQL (DATABASE_URL)');
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('Не вдалося запустити застосунок:', error.message);
    process.exit(1);
  }
}

bootstrap();
