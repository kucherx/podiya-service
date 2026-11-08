(() => {
  function init() {
    const body = document.querySelector('[data-table-body]');
    if (!body) return;

    const key = body.dataset.key;
    const canManage = body.dataset.manage === 'true';
    const hasDetail = body.dataset.detail === 'true';
    const centers = new Set((body.dataset.center || '').split(',').filter(Boolean).map(Number));
    const colspan = Number(body.dataset.colspan);
    const start = Number(body.dataset.start) || 0;
    const count = document.querySelector('[data-table-count]');

    const statusLabels = {
      draft: 'Чернетка', published: 'Опубліковано', cancelled: 'Скасовано',
      finished: 'Завершено', available: 'Доступний', reserved: 'Зарезервований', sold: 'Проданий'
    };
    const money = (value) => new Intl.NumberFormat('uk-UA', {
      style: 'currency', currency: 'UAH', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0
    }).format(Number(value) || 0);
    const date = (value) => value ? new Intl.DateTimeFormat('uk-UA', {
      dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Kyiv'
    }).format(new Date(value)) : '';
    const status = (value) => statusLabels[value] || value || '';
    const text = (value) => (value === null || value === undefined ? '' : String(value));

    const rowBuilders = {
      events: (item) => [
        item.id, item.title, item.location?.name, item.organizer?.name,
        date(item.startsAt), (item.categories || []).map((category) => category.name).join(', '),
        status(item.status)
      ],
      locations: (item) => [item.id, item.name, item.city, item.address, item.capacity],
      organizers: (item) => [item.id, item.name, item.city, item.email, item.phone, item.website],
      categories: (item) => [item.id, item.name, money(item.price), item.quantity, item.events?.length || 0],
      tickets: (item) => [
        item.id, item.code, item.event?.title, item.category?.name, item.client?.fullName,
        item.quantity || 1, status(item.status),
        money(Number(item.price || 0) * Number(item.quantity || 1))
      ],
      clients: (item) => [item.id, item.fullName, item.email, item.phone, item.city]
    };
    const names = {
      events: (item) => item.title, locations: (item) => item.name,
      organizers: (item) => item.name, categories: (item) => item.name,
      tickets: (item) => item.code, clients: (item) => item.fullName
    };
    const details = {
      events: (item) => `/events/${item.id}`,
      tickets: (item) => `/events/${item.event?.id}?ticket=${item.id}`
    };

    function cell(value, index) {
      const td = document.createElement('td');
      if (centers.has(index)) td.className = 'center';
      td.title = text(value);
      td.textContent = text(value);
      return td;
    }

    function actionLink(href, label, className) {
      const link = document.createElement('a');
      link.className = `btn btn-small ${className}`;
      link.href = href;
      link.textContent = label;
      return link;
    }

    function renderRow(item) {
      const values = rowBuilders[key](item).slice(start);
      const tr = document.createElement('tr');
      if (hasDetail && details[key]) {
        tr.className = 'row-link';
        tr.dataset.detail = details[key](item);
      }
      values.forEach((value, index) => tr.appendChild(cell(value, index)));
      if (hasDetail && details[key]) {
        const td = document.createElement('td');
        td.className = 'actions-cell';
        td.appendChild(actionLink(details[key](item), 'Деталі', 'btn-ghost'));
        tr.appendChild(td);
      }
      if (canManage) {
        const td = document.createElement('td');
        td.className = 'actions-cell';
        td.appendChild(actionLink(`/${key}/${item.id}/edit`, 'Редагувати', 'btn-ghost'));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn btn-small btn-danger';
        remove.dataset.delete = '';
        remove.dataset.resource = key;
        remove.dataset.id = item.id;
        remove.dataset.name = names[key](item) || `#${item.id}`;
        remove.textContent = 'Видалити';
        td.appendChild(remove);
        tr.appendChild(td);
      }
      return tr;
    }

    function empty() {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'empty-cell';
      td.colSpan = colspan;
      td.textContent = 'Записів поки немає';
      tr.appendChild(td);
      return tr;
    }

    fetch(`/api/${key}?limit=100`, { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error('Не вдалося завантажити дані.');
        return response.json();
      })
      .then((items) => {
        body.replaceChildren();
        if (count) count.textContent = items.length;
        if (!items.length) {
          body.appendChild(empty());
          return;
        }
        items.forEach((item) => body.appendChild(renderRow(item)));
      })
      .catch(() => {
        body.replaceChildren();
        body.appendChild(empty());
      });
  }

  window.tablePage = { init };
  init();
})();
