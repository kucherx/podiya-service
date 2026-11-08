(() => {
  const modal = document.getElementById('password-modal');
  const form = document.getElementById('password-form');
  const user = document.getElementById('password-user');
  const result = document.getElementById('password-result');
  const value = document.getElementById('password-value');
  const submit = document.getElementById('password-submit');
  const copy = document.getElementById('password-copy');
  let lastTrigger = null;

  function close() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastTrigger?.focus();
  }

  function open(button) {
    if (!modal) return;
    lastTrigger = button;
    form.action = `/users/${button.dataset.id}/password`;
    user.textContent = button.dataset.name || '';
    form.hidden = false;
    result.hidden = true;
    value.textContent = '';
    submit.disabled = false;
    submit.textContent = 'Згенерувати новий пароль';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    submit.focus();
  }

  async function copyPassword() {
    const text = value.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    copy.textContent = 'Скопійовано';
    setTimeout(() => { copy.textContent = 'Скопіювати'; }, 1500);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-password]');
    if (button) {
      event.preventDefault();
      open(button);
      return;
    }
    if (event.target.closest('[data-password-close]')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) close();
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;
    submit.textContent = 'Генеруємо...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'X-Requested-With': 'fetch', Accept: 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      value.textContent = data.password;
      form.hidden = true;
      result.hidden = false;
      copy.textContent = 'Скопіювати';
      copy.focus();
    } catch {
      submit.disabled = false;
      submit.textContent = 'Спробувати ще раз';
    }
  });

  copy?.addEventListener('click', copyPassword);
})();
