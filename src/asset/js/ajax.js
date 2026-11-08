(() => {
  function initComponents() {
    window.initSelects?.();
    window.initMultiSelect?.();
    window.initPhoneHints?.();
    window.initSteppers?.();
    window.initDatePickers?.();
  }

  function replacePage(html, push, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newHeader = doc.querySelector('header');
    const newMain = doc.querySelector('main');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (!newHeader || !newMain || !header || !main) {
      if (url) window.location.assign(url);
      return;
    }
    header.replaceWith(newHeader);
    main.replaceWith(newMain);
    document.title = doc.title;
    if (push && url) history.pushState({}, '', url);
    initComponents();
    window.scrollTo({ top: 0 });
  }

  async function swapPage(url, push = true) {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });
    replacePage(await response.text(), push, url);
  }

  function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function showDeleteError(message) {
    const card = document.querySelector('.modal-card');
    if (!card) return;
    card.querySelector('.ajax-delete-error')?.remove();
    const box = document.createElement('div');
    box.className = 'alert alert-error ajax-delete-error';
    box.textContent = message;
    card.querySelector('#delete-form')?.before(box);
  }

  function showAuthErrors(modalName, errors = {}, values = {}) {
    const root = document.getElementById('auth-modal');
    if (!root) return;

    root.hidden = false;
    document.body.classList.add('modal-open');
    root.querySelectorAll('[data-auth-card]').forEach((card) => {
      card.hidden = card.dataset.authCard !== modalName;
    });

    const card = root.querySelector(`[data-auth-card="${modalName}"]`);
    if (!card) return;
    card.querySelectorAll('[data-ajax-error], .auth-ajax-alert').forEach((node) => node.remove());

    if (errors._form) {
      const box = document.createElement('div');
      box.className = 'alert alert-error auth-ajax-alert';
      box.textContent = errors._form;
      card.querySelector('form')?.before(box);
    }

    for (const [name, message] of Object.entries(errors)) {
      if (name === '_form') continue;
      const input = card.querySelector(`[name="${name}"]`);
      if (!input) continue;
      const error = document.createElement('p');
      error.className = 'field-error';
      error.dataset.ajaxError = '1';
      error.textContent = message;
      input.insertAdjacentElement('afterend', error);
    }

    for (const [name, value] of Object.entries(values)) {
      const input = card.querySelector(`[name="${name}"]`);
      if (input && input.type !== 'password') input.value = value;
    }
  }

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-ajax]');
    if (!form) return;
    event.preventDefault();

    const submit = form.querySelector('button[type="submit"]');
    submit?.setAttribute('disabled', '');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'fetch',
          Accept: 'application/json'
        }
      });
      const type = response.headers.get('content-type') || '';

      if (type.includes('application/json')) {
        const data = await response.json();

        if (!data.ok) {
          if (data.modal) showAuthErrors(data.modal, data.errors, data.values);
          else if (form.id === 'delete-form') showDeleteError(data.message || 'Не вдалося видалити запис.');
          else showDeleteError(data.message || 'Не вдалося виконати дію.');
          return;
        }

        if (data.auth) {
          document.getElementById('auth-modal')?.remove();
          document.body.classList.remove('modal-open');
        }
        if (form.id === 'delete-form') closeDeleteModal();
        if (data.redirect) await swapPage(data.redirect);
        return;
      }

      replacePage(await response.text(), false, null);
    } finally {
      submit?.removeAttribute('disabled');
    }
  });

  window.addEventListener('popstate', () => swapPage(location.pathname + location.search, false));
})();
