function columnFor(field) {
  if (field.relation) return `${field.name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}_id`;
  return field.name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function fieldForColumn(config, column) {
  return config.fields.find((field) => columnFor(field) === column || field.name === column);
}

function columnsFrom(text) {
  const match = text.match(/constraint failed:\s*([^\n]+)/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((part) => part.trim().replace(/['"]/g, '').split('.').pop());
}

export function mapDbError(error, config) {
  const text = `${error?.message || ''} ${error?.driverError?.message || ''}`;
  const columns = columnsFrom(text);

  if (/unique constraint failed|duplicate key/i.test(text)) {
    for (const group of config.uniqueGroups || []) {
      const expected = group.fields.map((name) => {
        const field = config.fields.find((item) => item.name === name);
        return field ? columnFor(field) : name;
      });
      if (expected.every((column) => columns.includes(column))) {
        return { [group.fields[group.fields.length - 1]]: group.message };
      }
    }

    for (const column of columns) {
      const field = fieldForColumn(config, column);
      if (!field) continue;
      return {
        [field.name]: field.type === 'email'
          ? 'Така email-адреса вже використовується.'
          : 'Таке значення вже використовується.'
      };
    }

    return { _form: 'Запис із такими самими даними вже існує.' };
  }

  if (/foreign key constraint failed/i.test(text)) {
    return { _form: 'Пов’язаний запис не існує або його не можна змінити.' };
  }

  if (/not null constraint failed/i.test(text)) {
    const field = columns.map((column) => fieldForColumn(config, column)).find(Boolean);
    return field
      ? { [field.name]: `Заповніть поле «${field.label}».` }
      : { _form: 'Обов’язкове поле не заповнене.' };
  }

  if (/check constraint failed/i.test(text)) {
    return { _form: 'Значення не відповідає обмеженням бази даних.' };
  }

  return { _form: 'Не вдалося зберегти запис. Перевірте введені дані.' };
}
