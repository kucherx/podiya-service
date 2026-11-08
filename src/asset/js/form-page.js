(() => {
  async function json(url) {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    return response.ok ? response.json() : null;
  }
  function label(item) {
    return item.label || item.name || item.title || item.fullName || `#${item.id}`;
  }
  function populateSelect(form, name, items) {
    const select = form.querySelector(`select[name="${name}"]`);
    if (!select) return;
    const prompt = select.querySelector('option[value=""]');
    const text = prompt ? prompt.textContent : 'Оберіть значення';
    select.replaceChildren();
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = text;
    select.appendChild(empty);
    for (const item of items) {
      const option = document.createElement('option');
      option.value = String(item.id);
      option.textContent = label(item);
      if (item.dataEvents) option.dataset.events = item.dataEvents;
      select.appendChild(option);
    }
  }
  function populateMulti(form, name, items) {
    const container = form.querySelector(`[data-multiselect-name="${name}"]`);
    if (!container) return;
    const options = container.querySelector('.multi-options');
    options.replaceChildren();
    for (const item of items) {
      const row = document.createElement('label');
      row.className = 'multi-option';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.name = name;
      box.value = String(item.id);
      const text = document.createElement('span');
      text.textContent = label(item);
      row.append(box, text);
      options.appendChild(row);
    }
    const empty = document.createElement('p');
    empty.className = 'multi-empty';
    empty.hidden = true;
    empty.textContent = 'Нічого не знайдено';
    options.appendChild(empty);
    delete container.dataset.ready;
  }
  function valueFor(record, name, resource) {
    if (resource === 'users') {
      if (name === 'organizerId') return record.organizer?.id ?? '';
      if (name === 'clientId') return record.client?.id ?? '';
    }
    const value = record[name];
    return value && typeof value === 'object' && !Array.isArray(value) ? value.id : value;
  }
  function inputDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
  }
  function displayDate(value) {
    if (!value) return '';
    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}, ${time}`;
  }
  function fill(form, resource, record) {
    for (const element of form.querySelectorAll('[name]')) {
      if (element.type === 'checkbox') continue;
      const value = valueFor(record, element.name, resource);
      if (element.tagName === 'SELECT') {
        element.value = value === undefined || value === null ? '' : String(value);
        continue;
      }
      if (element.type === 'hidden' && element.closest('[data-datepicker]')) {
        const input = inputDate(value);
        element.value = input;
        const display = element.closest('[data-datepicker]')?.querySelector('.date-display');
        if (display) display.value = displayDate(input);
        continue;
      }
      if (value !== undefined && value !== null) element.value = value;
    }
    for (const container of form.querySelectorAll('[data-multiselect-name]')) {
      const values = record[container.dataset.multiselectName] || [];
      const selected = new Set(values.map((item) => String(item.id ?? item)));
      for (const box of container.querySelectorAll('input[type="checkbox"]')) {
        box.checked = selected.has(box.value);
      }
    }
  }
  function resetSelects(form) {
    form.querySelectorAll('select[data-custom-select]').forEach((select) => {
      const wrapper = select.closest('.custom-select');
      if (!wrapper) return;
      wrapper.replaceWith(select);
      select.classList.remove('custom-select-native');
      select.removeAttribute('aria-hidden');
      select.removeAttribute('tabindex');
    });
    window.initSelects?.();
  }
  async function init() {
    const form = document.querySelector('[data-form-page]');
    if (!form) return;
    const resource = form.dataset.formResource;
    const id = form.dataset.formId;
    const refs = await json(`/api/reference/form/${resource}`) || {};
    for (const [name, items] of Object.entries(refs)) {
      if (!Array.isArray(items)) continue;
      if (form.querySelector(`[data-multiselect-name="${name}"]`)) populateMulti(form, name, items);
      else populateSelect(form, name, items);
    }
    if (id) {
      const record = await json(`/api/${resource}/${id}`);
      if (!record) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = 'Не вдалося завантажити запис.';
        form.before(alert);
        form.hidden = true;
        return;
      }
      fill(form, resource, record);
    }
    resetSelects(form);
    window.initMultiSelect?.();
    window.initSteppers?.();
    window.initPhoneHints?.();
    form.querySelector('[data-user-role]')?.dispatchEvent(new Event('change', { bubbles: true }));
  }
  window.formPage = { init };
  init();
})();
