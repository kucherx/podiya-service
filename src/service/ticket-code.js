import { AppDataSource } from '../db/data-source.js';

export async function nextTicketCode(eventId, categoryId) {
  const repository = AppDataSource.getRepository('Ticket');
  const count = await repository.count({
    where: { event: { id: eventId }, category: { id: categoryId } }
  });
  const base = `POD-${String(eventId).padStart(2, '0')}-${String(categoryId).padStart(2, '0')}`;
  let number = count + 1;
  let code = `${base}-${String(number).padStart(2, '0')}`;

  while (await repository.findOneBy({ code })) {
    number += 1;
    code = `${base}-${String(number).padStart(2, '0')}`;
  }

  return code;
}
