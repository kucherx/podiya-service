(() => {
  function init() {
    const body = document.querySelector('[data-users-body]');
    if (!body) return;

    const currentId = Number(body.dataset.current);
    const count = document.querySelector('[data-users-count]');
    const labels = {
      admin: 'Адміністратор',
      organizer: 'Організатор',
      client: 'Клієнт'
    };

    function text(value) {
      return value === null || value === undefined ? '' : String(value);
    }

    function cell(value, center = false) {
      const td = document.createElement('td');
      if (center) td.className = 'center';
      td.title = text(value);
      td.textContent = text(value);
      return td;
    }

    function button(label, className, dataset) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `btn btn-small ${className}`;
      element.textContent = label;
      Object.assign(element.dataset, dataset);
      return element;
    }

    function renderRow(user) {
      const tr = document.createElement('tr');
      tr.appendChild(cell(user.id, true));
      tr.appendChild(cell(user.name));
      tr.appendChild(cell(user.email));
      tr.appendChild(cell(labels[user.role] || user.role, true));

      const actions = document.createElement('td');
      actions.className = 'actions-cell';

      const edit = document.createElement('a');
      edit.className = 'btn btn-small btn-ghost';
      edit.href = `/users/${user.id}/edit`;
      edit.textContent = 'Редагувати';
      actions.appendChild(edit);
      actions.appendChild(button('Пароль', 'btn-ghost', {
        password: '',
        id: user.id,
        name: user.name
      }));

      if (user.id !== currentId) {
        actions.appendChild(button('Видалити', 'btn-danger', {
          delete: '',
          resource: 'users',
          id: user.id,
          name: user.name
        }));
      }

      tr.appendChild(actions);
      return tr;
    }

    function empty() {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'empty-cell';
      td.colSpan = 5;
      td.textContent = 'Користувачів поки немає';
      tr.appendChild(td);
      return tr;
    }

    fetch('/api/users', { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error('Не вдалося завантажити користувачів.');
        return response.json();
      })
      .then((users) => {
        body.replaceChildren();
        if (count) count.textContent = users.length;
        if (!users.length) {
          body.appendChild(empty());
          return;
        }
        users.forEach((user) => body.appendChild(renderRow(user)));
      })
      .catch(() => {
        body.replaceChildren();
        body.appendChild(empty());
      });
  }

  window.usersPage = { init };
  init();
})();
