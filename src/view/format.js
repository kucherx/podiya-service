export const eventStatusOptions = [
  { value: 'draft', label: 'Чернетка' },
  { value: 'published', label: 'Опубліковано' },
  { value: 'cancelled', label: 'Скасовано' },
  { value: 'finished', label: 'Завершено' }
];

export const ticketStatusOptions = [
  { value: 'available', label: 'Доступний' },
  { value: 'reserved', label: 'Зарезервований' },
  { value: 'sold', label: 'Проданий' },
  { value: 'cancelled', label: 'Скасований' }
];

const statusLabels = Object.fromEntries(
  [...eventStatusOptions, ...ticketStatusOptions].map((option) => [option.value, option.label])
);

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Kyiv'
});

const inputFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Kyiv',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
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

export function formatInputDateTime(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
  const parts = Object.fromEntries(
    inputFormatter.formatToParts(value).map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatDateDisplay(value) {
  if (!value) return '';
  const [date, time] = String(value).split('T');
  const [year, month, day] = date.split('-');
  return time ? `${day}.${month}.${year}, ${time}` : `${day}.${month}.${year}`;
}

export function parseInputDateTime(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value));
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = kyivOffsetMinutes(new Date(utcGuess));
  const parsed = new Date(utcGuess - offset * 60_000);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Зсув Києва для конкретної миті: +02:00 взимку, +03:00 влітку.
 * Беремо полудень UTC, щоб не попасти на нічний перехід DST.
 */
function kyivOffsetMinutes(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Kyiv',
    timeZoneName: 'longOffset'
  }).formatToParts(date);
  const name = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT+02:00';
  const offset = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!offset) return 120;
  const sign = offset[1] === '-' ? -1 : 1;
  return sign * (Number(offset[2]) * 60 + Number(offset[3]));
}
