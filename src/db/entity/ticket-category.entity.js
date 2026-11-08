import { EntitySchema } from 'typeorm';

export const TicketCategory = new EntitySchema({
  name: 'TicketCategory',
  tableName: 'ticket_categories',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, length: 120 },
    description: { type: 'text', nullable: true },
    price: { type: 'real' },
    quantity: { type: Number },
    createdAt: { type: Date, createDate: true }
  },
  relations: {
    event: {
      type: 'many-to-one',
      target: 'Event',
      inverseSide: 'categories',
      joinColumn: { name: 'event_id' },
      nullable: false,
      onDelete: 'CASCADE'
    },
    tickets: {
      type: 'one-to-many',
      target: 'Ticket',
      inverseSide: 'category'
    }
  },
  indices: [{ columns: ['event'] }],
  uniques: [{ columns: ['event', 'name'] }]
});
