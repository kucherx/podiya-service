document.querySelectorAll('input[type="tel"]').forEach((input) => {
  const hint = document.createElement('p');
  hint.className = 'field-hint';
  input.insertAdjacentElement('afterend', hint);

  const update = () => {
    const digits = input.value.replace(/\D/g, '');
    const international = digits.startsWith('380');
    const required = international ? 12 : 10;
    const left = Math.max(0, required - digits.length);
    const validPrefix = !digits || international || digits.startsWith('0');

    if (left > 0) hint.textContent = `Залишилось цифр: ${left}`;
    else if (!validPrefix) hint.textContent = 'Номер має починатися з 0 або +380';
    else hint.textContent = 'Кількість цифр достатня';

    hint.classList.toggle('complete', left === 0 && validPrefix);
  };

  input.addEventListener('input', update);
  update();
});
