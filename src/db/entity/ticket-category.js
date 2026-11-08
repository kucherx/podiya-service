import { EntitySchema } from 'typeorm';

export const TicketCategory = new EntitySchema({
  name: 'TicketCategory',
  tableName: 'ticket_categories',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, length: 120, unique: true },
    description: { type: 'text', nullable: true },
    price: { type: 'real' },
    quantity: { type: Number },
    createdAt: { type: Date, createDate: true }
  },
  relations: {
    events: {
      type: 'many-to-many',
      target: 'Event',
      inverseSide: 'categories'
    },
    tickets: {
      type: 'one-to-many',
      target: 'Ticket',
      inverseSide: 'category'
    }
  }
});
