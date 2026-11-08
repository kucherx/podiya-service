(() => {
  const labels = {
    draft: 'Чернетка', published: 'Опубліковано', cancelled: 'Скасовано',
    finished: 'Завершено', available: 'Доступний', reserved: 'Зарезервований', sold: 'Проданий'
  };
  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => escapeMap[char]);
  const money = (value) => new Intl.NumberFormat('uk-UA', {
    style: 'currency', currency: 'UAH', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0
  }).format(Number(value) || 0);
  const date = (value) => value ? new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Kyiv'
  }).format(new Date(value)) : '';
  const status = (value) => labels[value] || value || '';

  function hero(event) {
    return `<nav class="crumbs"><a href="/events">Події</a><span class="crumb-sep">/</span><span>${esc(event.title)}</span></nav>
      <section class="event-hero"><div><p class="event-status">${esc(status(event.status))}</p><h1>${esc(event.title)}</h1><p class="event-lead">${esc(event.description)}</p></div>
      <dl class="event-facts">
        <div><dt>Початок</dt><dd>${date(event.startsAt)}</dd></div>
        <div><dt>Завершення</dt><dd>${date(event.endsAt)}</dd></div>
        <div><dt>Локація</dt><dd>${esc(event.location?.name)}</dd></div>
        <div><dt>Організатор</dt><dd>${esc(event.organizer?.name)}</dd></div>
      </dl></section>`;
  }

  function buyForm(event, category) {
    return `<form class="buy-form" method="post" action="/events/${event.id}" data-ajax data-api data-api-action="/api/tickets" data-redirect="/events/${event.id}?notice=reserved" novalidate>
      <input type="hidden" name="event" value="${event.id}">
      <input type="hidden" name="category" value="${category.id}">
      <label class="buy-qty" for="buy-qty-${category.id}"><span>Кількість</span>
        <input id="buy-qty-${category.id}" type="number" name="quantity" value="1" min="1" max="${category.available}" step="1">
      </label>
      <button class="btn btn-primary btn-small" type="submit">Купити</button>
    </form>`;
  }

  function categories(event, role) {
    const canBuy = role === 'client' && event.status === 'published';
    const cards = (event.categories || []).map((category) => `<article class="category-card${category.available ? '' : ' category-sold'}">
      <h3>${esc(category.name)}</h3><p class="category-price">${money(category.price)}</p>
      <p class="category-stock">Доступно: ${category.available}</p>
      ${canBuy ? (category.available ? buyForm(event, category) : '<span class="badge badge-muted">Продано</span>') : ''}
    </article>`).join('');
    const hint = role === 'guest'
      ? '<p class="event-login-hint">Щоб придбати квиток, увійдіть у свій акаунт. <button type="button" class="link-button" data-open-auth="login">Увійти</button></p>'
      : '';
    return `<section class="event-section"><h2>Категорії квитків</h2>
      <div class="category-grid">${cards || '<p class="subtitle">Для цієї події ще не додано категорій.</p>'}</div>${hint}</section>`;
  }

  function ticketActions(ticket, eventId, manager) {
    if (manager && ticket.status === 'reserved') {
      return `<form method="post" action="/events/${eventId}" data-ajax data-api data-api-action="/api/tickets/${ticket.id}/pay" data-redirect="/events/${eventId}?notice=paid" novalidate><button class="btn btn-small btn-ghost" type="submit">Підтвердити оплату</button></form>`;
    }
    if (manager && ticket.status === 'sold' && !ticket.checkedInAt) {
      return `<form method="post" action="/events/${eventId}" data-ajax data-api data-api-action="/api/tickets/${ticket.id}/check-in" data-redirect="/events/${eventId}?notice=checkedIn" novalidate><button class="btn btn-small btn-ghost" type="submit">Відмітити</button></form>`;
    }
    return '';
  }

  function cancelForm(ticket, eventId) {
    return `<form method="post" action="/events/${eventId}" data-ajax data-api data-api-action="/api/tickets/${ticket.id}/cancel" data-redirect="/events/${eventId}?notice=cancelled" novalidate><button class="btn btn-small btn-danger" type="submit">Скасувати</button></form>`;
  }

  function ownTable(tickets, eventId, highlightId) {
    if (!tickets.length) return '';
    const rows = tickets.map((ticket) => `<tr id="ticket-${ticket.id}"${Number(ticket.id) === Number(highlightId) ? ' class="ticket-highlight"' : ''}>
      <td class="center">${esc(ticket.code)}</td><td>${esc(ticket.category?.name)}</td>
      <td class="center">${esc(status(ticket.status))}</td><td class="center">${ticket.paidAt ? 'Оплачено' : 'Очікує'}</td>
      <td class="center">${ticket.quantity || 1}</td><td class="center">${money(Number(ticket.price || 0) * Number(ticket.quantity || 1))}</td>
      <td class="actions-cell">${ticket.status === 'reserved' ? cancelForm(ticket, eventId) : ''}</td></tr>`).join('');
    return `<section class="event-section"><h2>Мої квитки на цю подію</h2><div class="table-card"><table>
      <thead><tr><th>Код</th><th>Категорія</th><th>Статус</th><th>Оплата</th><th>К-сть</th><th>Сума</th><th>Дія</th></tr></thead>
      <tbody>${rows}</tbody></table></div></section>`;
  }

  function managerTable(tickets, eventId, highlightId) {
    const rows = tickets.map((ticket) => `<tr id="ticket-${ticket.id}"${Number(ticket.id) === Number(highlightId) ? ' class="ticket-highlight"' : ''}>
      <td class="center">${esc(ticket.code)}</td><td>${esc(ticket.category?.name)}</td>
      <td>${ticket.client ? esc(ticket.client.fullName) : '—'}</td>
      <td>${ticket.client ? `${esc(ticket.client.email)} · ${esc(ticket.client.phone)}` : '—'}</td>
      <td class="center">${esc(status(ticket.status))}</td><td class="center">${ticket.paidAt ? 'Так' : 'Ні'}</td>
      <td class="center">${ticket.checkedInAt ? 'Так' : 'Ні'}</td><td class="center">${ticket.quantity || 1}</td>
      <td class="center">${money(Number(ticket.price || 0) * Number(ticket.quantity || 1))}</td>
      <td class="actions-cell">${ticketActions(ticket, eventId, true)}${ticket.status !== 'cancelled' ? cancelForm(ticket, eventId) : ''}</td></tr>`).join('');
    const empty = '<tr><td class="empty-cell" colspan="10">Квитків ще немає</td></tr>';
    return `<section class="event-section"><h2>Квитки події</h2><div class="table-card"><table>
      <thead><tr><th>Код</th><th>Категорія</th><th>Клієнт</th><th>Контакти</th><th>Статус</th><th>Оплата</th><th>Присутність</th><th>К-сть</th><th>Сума</th><th>Дії</th></tr></thead>
      <tbody>${rows || empty}</tbody></table></div></section>`;
  }

  function render(event, tickets, role, highlightId) {
    const manager = role === 'admin' || role === 'organizer';
    return `${hero(event)}${categories(event, role)}${role === 'client' ? ownTable(tickets, event.id, highlightId) : ''}${manager ? managerTable(tickets, event.id, highlightId) : ''}`;
  }

  window.eventView = { render };
})();
