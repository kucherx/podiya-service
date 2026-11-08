import { isBlank, validateMulti, validateValue } from './values.js';
import { validateUnique, validateGroups } from './unique.js';

export async function validate(config, raw, id) {
  const errors = {};
  const data = {};

  for (const field of config.fields) {
    if (field.type === 'multiselect') {
      await validateMulti(field, raw[field.name], data, errors);
      continue;
    }
    if (isBlank(raw[field.name])) {
      data[field.name] = null;
      if (field.required) errors[field.name] = `Заповніть поле «${field.label}».`;
      continue;
    }
    await validateValue(field, raw[field.name], data, errors);
  }

  for (const field of config.fields) await validateUnique(config, field, data, errors, id);
  await validateGroups(config, data, errors, id);
  config.after?.(data, errors);

  return { errors, data };
}
