import { EntitySchema } from 'typeorm';

export const Ticket = new EntitySchema({
  name: 'Ticket',
  tableName: 'tickets',
  columns: {
    id: { type: Number, primary: true, generated: true },
    code: { type: String, length: 32, unique: true },
    status: { type: String, length: 32, default: 'available' },
    price: { type: 'real' },
    quantity: { type: Number, default: 1 },
    purchasedAt: { type: 'datetime', nullable: true },
    paidAt: { type: 'datetime', nullable: true },
    checkedInAt: { type: 'datetime', nullable: true },
    createdAt: { type: Date, createDate: true }
  },
  relations: {
    event: {
      type: 'many-to-one',
      target: 'Event',
      inverseSide: 'tickets',
      joinColumn: { name: 'event_id' },
      nullable: false,
      onDelete: 'CASCADE'
    },
    category: {
      type: 'many-to-one',
      target: 'TicketCategory',
      inverseSide: 'tickets',
      joinColumn: { name: 'category_id' },
      nullable: false,
      onDelete: 'CASCADE'
    },
    client: {
      type: 'many-to-one',
      target: 'Client',
      inverseSide: 'tickets',
      joinColumn: { name: 'client_id' },
      nullable: true,
      onDelete: 'SET NULL'
    }
  },
  indices: [
    { columns: ['event'] },
    { columns: ['status'] }
  ]
});
