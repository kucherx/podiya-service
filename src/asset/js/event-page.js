(() => {
  function showError(root, status, message) {
    const title = status === 403 ? 'Доступ заборонено' : status === 404 ? 'Подію не знайдено' : 'Помилка';
    root.replaceChildren();
    const section = document.createElement('section');
    section.className = 'page-head';
    const box = document.createElement('div');
    const heading = document.createElement('h1');
    const text = document.createElement('p');
    heading.textContent = title;
    text.className = 'subtitle';
    text.textContent = message || 'Не вдалося завантажити подію.';
    box.append(heading, text);
    section.appendChild(box);
    root.appendChild(section);
  }

  async function init() {
    const root = document.querySelector('[data-event-page]');
    if (!root) return;

    const id = root.dataset.id;
    const role = root.dataset.role;
    const authenticated = root.dataset.authenticated === '1';

    try {
      const eventResponse = await fetch(`/api/events/${id}`, { headers: { Accept: 'application/json' } });
      const event = await eventResponse.json().catch(() => ({}));
      if (!eventResponse.ok) {
        showError(root, eventResponse.status, event.message);
        return;
      }

      let tickets = [];
      if (authenticated) {
        const ticketsResponse = await fetch(`/api/tickets?event=${id}&limit=100`, {
          headers: { Accept: 'application/json' }
        });
        if (ticketsResponse.ok) tickets = await ticketsResponse.json();
      }

      const highlight = new URLSearchParams(location.search).get('ticket');
      root.innerHTML = window.eventView.render(event, tickets, role, highlight);
      document.title = `${event.title} — Менеджер подій`;
      window.initSteppers?.();
      root.querySelector('.ticket-highlight')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch {
      showError(root, 500, 'Не вдалося завантажити подію.');
    }
  }

  window.eventPage = { init };
  init();
})();
