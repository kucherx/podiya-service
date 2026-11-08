(() => {
  async function init() {
    const root = document.querySelector('[data-profile-page]');
    if (!root) return;

    const response = await fetch('/api/profile', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const data = await response.json();

    document.querySelectorAll('[data-profile-name]').forEach((node) => {
      node.textContent = data.name || '';
    });
    const email = document.querySelector('[data-profile-email]');
    if (email) email.textContent = data.email || '';

    for (const key of ['phone', 'city', 'website']) {
      const value = data[key] || '';
      const node = document.querySelector(`[data-profile-${key}]`);
      if (node) node.textContent = value;
      const fact = document.querySelector(`[data-profile-fact="${key}"]`);
      if (fact) fact.hidden = !value;
    }

    const form = document.querySelector('[data-profile-form]');
    if (!form || !data.record) return;
    for (const input of form.querySelectorAll('[name]')) {
      const value = data.record[input.name];
      if (value !== undefined && value !== null) input.value = value;
    }
  }

  window.profilePage = { init };
  init();
})();
