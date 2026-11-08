import { MONTHS, WEEKDAYS, make, parseValue, toValue, displayValue, navButton, createTimeRow } from './date-utils.js';

function initDatePicker(control) {
  const hidden = control.querySelector('input[type="hidden"]');
  const display = control.querySelector('.date-display');
  const toggle = control.querySelector('.date-toggle');
  const popover = control.querySelector('.date-popover');
  const now = new Date();
  let selected = parseValue(hidden.value);
  let view = selected ? { year: selected.year, month: selected.month } : null;

  function sync() {
    hidden.value = selected ? toValue(selected) : '';
    display.value = displayValue(selected);
  }

  function ensureView() {
    if (!view) view = { year: selected?.year || now.getFullYear(), month: selected?.month || now.getMonth() + 1 };
  }

  function close() {
    popover.hidden = true;
  }

  function render() {
    ensureView();
    popover.innerHTML = '';

    const head = make('div', 'date-head');
    const prev = navButton('prev');
    const next = navButton('next');
    const month = make('select', 'date-month');
    month.setAttribute('aria-label', 'Місяць');
    MONTHS.forEach((name, index) => {
      const option = make('option', '', name);
      option.value = String(index + 1);
      month.appendChild(option);
    });
    month.value = String(view.month);

    const year = make('input', 'date-year');
    year.type = 'number';
    year.min = '1900';
    year.max = '2200';
    year.value = String(view.year);
    year.setAttribute('aria-label', 'Рік');

    prev.addEventListener('click', () => {
      view.month -= 1;
      if (view.month === 0) { view.month = 12; view.year -= 1; }
      render();
    });
    next.addEventListener('click', () => {
      view.month += 1;
      if (view.month === 13) { view.month = 1; view.year += 1; }
      render();
    });
    month.addEventListener('change', () => {
      view.month = Number(month.value);
      render();
    });
    year.addEventListener('change', () => {
      const value = Number(year.value);
      if (Number.isInteger(value) && value >= 1900 && value <= 2200) {
        view.year = value;
        render();
      } else {
        year.value = String(view.year);
      }
    });
    year.addEventListener('focus', () => year.select());
    head.append(prev, month, year, next);

    const weekdays = make('div', 'date-weekdays');
    WEEKDAYS.forEach((day) => weekdays.appendChild(make('span', '', day)));

    const grid = make('div', 'date-grid');
    const offset = (new Date(view.year, view.month - 1, 1).getDay() + 6) % 7;
    const total = new Date(view.year, view.month, 0).getDate();
    for (let i = 0; i < offset; i += 1) grid.appendChild(make('span', 'date-day blank'));

    for (let day = 1; day <= total; day += 1) {
      const button = make('button', 'date-day', String(day));
      button.type = 'button';
      if (selected?.year === view.year && selected.month === view.month && selected.day === day) button.classList.add('selected');
      if (now.getFullYear() === view.year && now.getMonth() + 1 === view.month && now.getDate() === day) button.classList.add('today');
      button.addEventListener('click', () => {
        selected = selected
          ? { ...selected, year: view.year, month: view.month, day }
          : { year: view.year, month: view.month, day, hour: now.getHours(), minute: now.getMinutes() };
        sync();
        render();
      });
      grid.appendChild(button);
    }

    const timeRow = createTimeRow(selected?.hour ?? 0, selected?.minute ?? 0, (hour, minute) => {
      selected = {
        year: selected?.year || view.year,
        month: selected?.month || view.month,
        day: selected?.day || now.getDate(),
        hour,
        minute
      };
      sync();
    });

    const foot = make('div', 'date-foot');
    const today = make('button', 'date-link', 'Сьогодні');
    const clear = make('button', 'date-link muted', 'Очистити');
    const done = make('button', 'date-link', 'Готово');
    today.type = 'button';
    clear.type = 'button';
    done.type = 'button';
    today.addEventListener('click', () => {
      selected = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: now.getHours(), minute: now.getMinutes() };
      view = { year: selected.year, month: selected.month };
      sync();
      render();
    });
    clear.addEventListener('click', () => {
      selected = null;
      sync();
      close();
    });
    done.addEventListener('click', close);
    foot.append(today, clear, done);

    popover.append(head, weekdays, grid, timeRow, foot);
  }

  function open() {
    ensureView();
    render();
    popover.hidden = false;
  }

  toggle.addEventListener('click', () => (popover.hidden ? open() : close()));
  display.addEventListener('click', open);
  document.addEventListener('click', (event) => {
    if (!event.composedPath().includes(control)) close();
  });
  control.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  sync();
}

document.querySelectorAll('[data-datepicker]').forEach(initDatePicker);
