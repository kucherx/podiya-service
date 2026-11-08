(() => {
  function clearFormErrors(form) {
    form.querySelectorAll('[data-ajax-field-error], .ajax-form-error').forEach((node) => node.remove());
  }

  function showFormError(form, message) {
    if (!form) return;
    clearFormErrors(form);
    const box = document.createElement('p');
    box.className = 'field-error ajax-form-error';
    box.textContent = message;
    form.appendChild(box);
  }

  function showFieldError(form, field, message) {
    clearFormErrors(form);
    const input = form.querySelector(`[name="${field}"]`);
    const holder = input?.closest('.buy-qty, .field') || input?.parentElement;

    if (!holder) {
      showFormError(form, message);
      return;
    }

    const box = document.createElement('p');
    box.className = 'field-error';
    box.dataset.ajaxFieldError = '1';
    box.textContent = message;

    if (holder.tagName === 'LABEL') holder.insertAdjacentElement('afterend', box);
    else holder.appendChild(box);
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

  window.formFeedback = {
    clearFormErrors,
    showFormError,
    showFieldError,
    showDeleteError,
    showAuthErrors
  };
})();
