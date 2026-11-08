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

  document.addEventListener('input', (event) => {
    const form = event.target.closest('form[data-ajax]');
    if (!form) return;
    form.querySelectorAll('[data-ajax-field-error]').forEach((node) => node.remove());
  });

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
          if (data.modal) window.formFeedback.showAuthErrors(data.modal, data.errors, data.values);
          else if (form.id === 'delete-form') window.formFeedback.showDeleteError(data.message || 'Не вдалося видалити запис.');
          else if (data.field) window.formFeedback.showFieldError(form, data.field, data.message || 'Некоректне значення.');
          else window.formFeedback.showFormError(form, data.message || 'Не вдалося виконати дію.');
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
