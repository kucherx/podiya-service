function createSelect(select) {
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);
  select.classList.add('custom-select-native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'select-trigger';
  trigger.id = `${select.id}-trigger`;
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const value = document.createElement('span');
  value.className = 'select-value';
  trigger.appendChild(value);

  const menu = document.createElement('div');
  menu.className = 'select-menu';
  menu.hidden = true;

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'select-search';
  search.placeholder = 'Пошук...';
  search.autocomplete = 'off';
  search.setAttribute('aria-label', 'Пошук у списку');

  const options = document.createElement('div');
  options.className = 'select-options';

  menu.append(search, options);
  wrapper.append(trigger, menu);

  const label = document.querySelector(`label[for="${select.id}"]`);
  if (label) label.htmlFor = trigger.id;

  const items = Array.from(select.options).map((option) => ({
    value: option.value,
    label: option.textContent.trim(),
    events: (option.dataset.events || '').split(',').filter(Boolean)
  }));

  const parent = select.dataset.dependsOn
    ? document.querySelector(`select[name="${select.dataset.dependsOn}"]`)
    : null;

  function allowed(item) {
    if (!item.value || !parent) return true;
    if (!parent.value) return false;
    return item.events.includes(parent.value);
  }

  function updateValue() {
    const current = items.find((item) => item.value === select.value);
    if (current && !allowed(current)) select.value = '';
    const selected = select.options[select.selectedIndex];
    const text = selected && selected.value
      ? selected.textContent.trim()
      : select.dataset.placeholder || 'Оберіть значення';
    value.textContent = text;
    trigger.classList.toggle('empty', !selected || !selected.value);
  }

  function renderOptions(query = '') {
    const term = query.trim().toLowerCase();
    options.innerHTML = '';
    const filtered = items.filter((item) => allowed(item) && item.label.toLowerCase().includes(term));

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'select-empty';
      empty.textContent = 'Немає варіантів';
      options.appendChild(empty);
      return;
    }

    for (const item of filtered) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'select-option';
      button.textContent = item.label;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(item.value === select.value));
      button.classList.toggle('selected', item.value === select.value);
      button.addEventListener('click', () => {
        select.value = item.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        updateValue();
        close();
      });
      options.appendChild(button);
    }
  }

  function open() {
    document.querySelectorAll('.custom-select .select-menu').forEach((other) => {
      if (other !== menu) other.hidden = true;
    });
    menu.hidden = false;
    trigger.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    search.value = '';
    renderOptions();
    search.focus();
  }

  function close() {
    menu.hidden = true;
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => (menu.hidden ? open() : close()));
  search.addEventListener('input', () => renderOptions(search.value));
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      options.querySelector('.select-option')?.click();
    }
    if (event.key === 'Escape') close();
  });
  select.addEventListener('change', updateValue);
  parent?.addEventListener('change', () => {
    updateValue();
    if (!menu.hidden) renderOptions(search.value);
  });
  updateValue();
}

document.addEventListener('click', (event) => {
  document.querySelectorAll('.custom-select').forEach((wrapper) => {
    if (wrapper.contains(event.target)) return;
    const menu = wrapper.querySelector('.select-menu');
    const trigger = wrapper.querySelector('.select-trigger');
    if (menu && !menu.hidden) {
      menu.hidden = true;
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
});

document.querySelectorAll('select[data-custom-select]').forEach(createSelect);
