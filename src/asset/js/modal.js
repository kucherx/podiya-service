(() => {
  const modal = document.getElementById('delete-modal');
  const form = document.getElementById('delete-form');
  const name = document.getElementById('delete-name');
  const warning = document.getElementById('delete-warning');
  const related = document.getElementById('delete-related');
  const submit = document.getElementById('delete-submit');
  const cancel = modal?.querySelector('.modal-actions [data-close-modal]');
  let lastTrigger = null;

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastTrigger?.focus();
  }

  async function openModal(button) {
    if (!modal) return;

    const resource = button.dataset.resource;
    const id = button.dataset.id;

    lastTrigger = button;
    form.action = `/api/${resource}/${id}`;
    form.dataset.method = 'DELETE';
    form.dataset.api = '1';
    form.dataset.redirect = `/${resource}`;
    name.textContent = button.dataset.name || `#${id}`;
    related.innerHTML = '';
    warning.hidden = true;
    submit.disabled = true;
    modal.querySelector('.ajax-delete-error')?.remove();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    cancel?.focus();

    try {
      const response = await fetch(`/api/${resource}/${id}/related`);
      const data = await response.json();

      if (data.total > 0) {
        warning.hidden = false;
        for (const item of data.items) {
          const line = document.createElement('li');
          line.textContent = `${item.label}: ${item.count}`;
          related.appendChild(line);
        }
        submit.disabled = true;
        cancel?.focus();
      } else {
        submit.disabled = false;
        submit.focus();
      }
    } catch {
      submit.disabled = false;
      submit.focus();
    }
  }

  document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete]');
    if (deleteButton) {
      openModal(deleteButton);
      return;
    }

    if (event.target.closest('[data-close-modal]')) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = [...modal.querySelectorAll('button:not([disabled])')];
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
