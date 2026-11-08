export const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const pad = (value) => String(value).padStart(2, '0');

export function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function parseValue(value) {
  if (!value) return null;
  const [date, time = '00:00'] = value.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if ([year, month, day, hour, minute].some(Number.isNaN)) return null;
  return { year, month, day, hour, minute };
}

export function toValue(state) {
  return `${state.year}-${pad(state.month)}-${pad(state.day)}T${pad(state.hour)}:${pad(state.minute)}`;
}

export function displayValue(state) {
  return state ? `${pad(state.day)}.${pad(state.month)}.${state.year}, ${pad(state.hour)}:${pad(state.minute)}` : '';
}

export function navButton(direction) {
  const button = make('button', 'date-nav');
  button.type = 'button';
  button.setAttribute('aria-label', direction === 'prev' ? 'Попередній місяць' : 'Наступний місяць');
  const path = direction === 'prev' ? 'm7.5 2.5-3.5 3.5 3.5 3.5' : 'm4.5 2.5 3.5 3.5-3.5 3.5';
  button.innerHTML = `<svg viewBox="0 0 12 12"><path d="${path}"/></svg>`;
  return button;
}

export function createTimeRow(hourValue, minuteValue, onChange) {
  const row = make('div', 'date-time');
  const hour = make('input');
  const minute = make('input');
  hour.type = 'number';
  minute.type = 'number';
  hour.min = '0';
  hour.max = '23';
  minute.min = '0';
  minute.max = '59';
  hour.value = pad(hourValue);
  minute.value = pad(minuteValue);

  const update = () => {
    const hours = Math.min(23, Math.max(0, Number(hour.value) || 0));
    const minutes = Math.min(59, Math.max(0, Number(minute.value) || 0));
    hour.value = pad(hours);
    minute.value = pad(minutes);
    onChange(hours, minutes);
  };

  hour.addEventListener('change', update);
  minute.addEventListener('change', update);
  row.append(make('span', '', 'Час'), hour, make('span', '', ':'), minute);
  return row;
}
