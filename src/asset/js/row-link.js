(() => {
  document.addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-detail]');
    if (!row) return;
    if (event.target.closest('a, button, form, input, select, textarea')) return;
    window.location.assign(row.dataset.detail);
  });

  const highlighted = document.querySelector('.ticket-highlight');
  if (highlighted) {
    highlighted.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
})();
