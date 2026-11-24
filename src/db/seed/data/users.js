// Демонстраційні паролі. У db/seed.sql вони лежать відкрито, а в базу
// потрапляють через crypt(..., gen_salt('bf', 12)).
export const adminAccount = {
  email: 'event.manager.podiya@gmail.com',
  password: 'Adm!n-Podiya-2026-Kx7Q'
};

export const organizerPassword = 'Org!n-Podiya-2026-Lm3T';
export const clientPassword = 'Cl!ent-Podiya-2026-Rp9V';
