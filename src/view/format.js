const statusLabels = {
  draft: 'Чернетка',
  published: 'Опубліковано',
  cancelled: 'Скасовано',
  finished: 'Завершено',
  available: 'Доступний',
  reserved: 'Зарезервований',
  sold: 'Проданий'
};

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Kyiv'
});

const moneyFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0
});

export function formatDate(value) {
  return value instanceof Date ? dateFormatter.format(value) : '';
}

export function formatStatus(value) {
  return statusLabels[value] || value || '';
}

export function formatMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? moneyFormatter.format(number) : '';
}
