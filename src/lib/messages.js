export const notices = {
  created: 'Запис успішно створено.',
  updated: 'Зміни успішно збережено.',
  deleted: 'Запис успішно видалено.'
};

export const errors = {
  related: 'Не можна видалити запис, поки з ним пов’язані інші записи.',
  notFound: 'Запис не знайдено.',
  dbDelete: 'Не вдалося видалити запис. Спробуйте ще раз.',
  invalidId: 'Некоректний ідентифікатор запису.'
};

export function messageFromQuery(query) {
  if (query.notice && notices[query.notice]) {
    return { type: 'success', text: notices[query.notice] };
  }
  if (query.error && errors[query.error]) {
    return { type: 'error', text: errors[query.error] };
  }
  return null;
}
