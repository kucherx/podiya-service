(() => {
  const modal = document.getElementById('auth-modal');
  let lastTrigger = null;

  function activeCard() {
    return modal?.querySelector('[data-auth-card]:not([hidden])');
  }

  function focusables() {
    return [...(activeCard()?.querySelectorAll('input, button, a[href]') || [])];
  }

  function closeAuth() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastTrigger?.focus();
  }

  function openAuth(name, trigger) {
    if (!modal) return;
    lastTrigger = trigger || null;
    modal.hidden = false;
    modal.querySelectorAll('[data-auth-card]').forEach((card) => {
      card.hidden = card.dataset.authCard !== name;
      card.querySelectorAll('[data-ajax-error], .auth-ajax-alert').forEach((node) => node.remove());
    });
    document.body.classList.add('modal-open');
    const first = focusables().find((element) => element.tagName === 'INPUT');
    first?.focus();
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-auth]');
    if (opener) {
      openAuth(opener.dataset.openAuth, opener);
      return;
    }
    if (event.target.closest('[data-close-auth]')) closeAuth();
  });

  document.addEventListener('keydown', (event) => {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      closeAuth();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = focusables();
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

  if (modal?.dataset.auto) openAuth(modal.dataset.auto);
})();
