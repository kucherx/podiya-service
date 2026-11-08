function initMultiSelect() {
  document.querySelectorAll('[data-multiselect]').forEach((container) => {
    if (container.dataset.ready) return;
    container.dataset.ready = '1';

    const boxes = [...container.querySelectorAll('input[type="checkbox"]')];
    const options = boxes.map((box) => box.closest('.multi-option'));
    const counter = container.querySelector('.multi-count-value');
    const search = container.querySelector('.multi-search');
    const empty = container.querySelector('.multi-empty');

    const updateCount = () => {
      counter.textContent = String(boxes.filter((box) => box.checked).length);
    };

    const filter = () => {
      const term = search.value.trim().toLowerCase();
      let visible = 0;
      for (const option of options) {
        const match = option.textContent.toLowerCase().includes(term);
        option.hidden = !match;
        if (match) visible += 1;
      }
      empty.hidden = visible > 0;
    };

    boxes.forEach((box) => box.addEventListener('change', updateCount));
    search.addEventListener('input', filter);
    search.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        search.value = '';
        filter();
      }
    });
    updateCount();
  });
}

initMultiSelect();
window.initMultiSelect = initMultiSelect;
