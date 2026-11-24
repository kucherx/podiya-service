import app from '../src/app.js';

// Express-застосунок уже містить ініціалізацію PostgreSQL і віддає статику
// до підключення до бази. Vercel викликає його як звичайний Node-хендлер.
export default app;
