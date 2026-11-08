function createStepper(input) {
  const wrapper = document.createElement('div');
  wrapper.className = 'number-control';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const actions = document.createElement('div');
  actions.className = 'number-actions';

  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'number-step';
  up.setAttribute('aria-label', 'Збільшити');
  up.innerHTML = '<svg viewBox="0 0 12 12"><path d="m3 7 3-3 3 3"/></svg>';

  const down = document.createElement('button');
  down.type = 'button';
  down.className = 'number-step';
  down.setAttribute('aria-label', 'Зменшити');
  down.innerHTML = '<svg viewBox="0 0 12 12"><path d="m3 5 3 3 3-3"/></svg>';

  actions.append(up, down);
  wrapper.appendChild(actions);

  const change = (direction) => {
    const step = Number(input.step) || 1;
    const current = input.value === '' ? 0 : Number(input.value);
    if (!Number.isFinite(current)) return;
    const decimals = (String(step).split('.')[1] || '').length;
    input.value = Number((current + direction * step).toFixed(decimals));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  up.addEventListener('click', () => change(1));
  down.addEventListener('click', () => change(-1));
}

function initSteppers() {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    if (!input.closest('.number-control')) createStepper(input);
  });
}

initSteppers();
window.initSteppers = initSteppers;
