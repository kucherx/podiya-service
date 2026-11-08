function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const statusLabels = {
  draft: 'Чернетка',
  published: 'Опубліковано',
  cancelled: 'Скасовано',
  finished: 'Завершено',
  available: 'Доступний',
  reserved: 'Зарезервований',
  sold: 'Проданий'
};

function formatStatus(value) {
  return statusLabels[value] || value || '';
}

function formatDate(value) {
  if (!(value instanceof Date)) return '';
  return value.toISOString().slice(0, 16).replace('T', ' ');
}

export function renderMainPage(events) {
  const rows = events
    .map(
      (event) => `<tr>
        <td>${event.id}</td>
        <td>${escapeHtml(event.title)}</td>
        <td>${escapeHtml(event.location?.name)}</td>
        <td>${escapeHtml(event.organizer?.name)}</td>
        <td>${formatDate(event.startsAt)}</td>
        <td>${escapeHtml(formatStatus(event.status))}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Podiya</title>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Назва</th>
        <th>Локація</th>
        <th>Організатор</th>
        <th>Початок</th>
        <th>Статус</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}
