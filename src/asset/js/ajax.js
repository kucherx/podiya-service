(() => {
  function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function payload(form) {
    const data = {};
    for (const [name, value] of new FormData(form).entries()) {
      if (data[name] === undefined) data[name] = value;
      else if (Array.isArray(data[name])) data[name].push(value);
      else data[name] = [data[name], value];
    }
    return data;
  }

  function apiError(form, data) {
    if (form.id === 'delete-form') {
      window.formFeedback.showDeleteError(data.message || 'Не вдалося видалити запис.');
      return;
    }
    const card = form.closest('[data-auth-card]');
    if (card) {
      window.formFeedback.showAuthErrors(card.dataset.authCard, data.errors || { _form: data.message }, data.values || {});
      return;
    }
    if (data.errors) {
      window.formFeedback.showFieldErrors(form, data.errors);
      return;
    }
    if (data.field) {
      window.formFeedback.showFieldError(form, data.field, data.message);
      return;
    }
    window.formFeedback.showFormError(form, data.message || 'Не вдалося виконати дію.');
  }

  async function submitApi(form) {
    const method = form.dataset.method || 'POST';
    const options = {
      method,
      headers: { Accept: 'application/json' },
      credentials: 'same-origin'
    };
    if (method !== 'DELETE') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(payload(form));
    }

    const response = await fetch(form.dataset.apiAction || form.action, options);
    if (response.status === 204) {
      if (form.id === 'delete-form') closeDeleteModal();
      await window.pageSwap.swapPage(form.dataset.redirect || location.pathname);
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      apiError(form, data);
      return;
    }

    if (data.auth) {
      document.getElementById('auth-modal')?.remove();
      document.body.classList.remove('modal-open');
    }
    if (form.id === 'delete-form') closeDeleteModal();
    const target = data.redirect || form.dataset.redirect;
    if (form.dataset.reload) {
      window.location.assign(target || '/');
      return;
    }
    if (target) await window.pageSwap.swapPage(target);
  }

  async function submitForm(form) {
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
      if (data.redirect) await window.pageSwap.swapPage(data.redirect);
      return;
    }

    window.pageSwap.replacePage(await response.text(), false, null);
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
      if (form.hasAttribute('data-api')) await submitApi(form);
      else await submitForm(form);
    } finally {
      submit?.removeAttribute('disabled');
    }
  });

  window.addEventListener('popstate', () => window.pageSwap.swapPage(location.pathname + location.search, false));
})();
