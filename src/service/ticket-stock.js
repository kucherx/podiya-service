import { In } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';

const occupiedStatuses = In(['reserved', 'sold']);

export async function occupiedCount(eventId, categoryId) {
  const rows = await AppDataSource.getRepository('Ticket').find({
    where: { event: { id: eventId }, category: { id: categoryId }, status: occupiedStatuses }
  });
  return rows.reduce((sum, ticket) => sum + Number(ticket.quantity || 1), 0);
}
