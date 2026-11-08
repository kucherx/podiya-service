(() => {
  function updateProfiles() {
    const role = document.querySelector('[data-user-role]');
    if (!role) return;
    document.querySelectorAll('[data-profile]').forEach((field) => {
      field.hidden = field.dataset.profile !== role.value;
    });
  }

  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-user-role]')) updateProfiles();
  });

  updateProfiles();
})();
