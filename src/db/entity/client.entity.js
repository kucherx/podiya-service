import { EntitySchema } from 'typeorm';

export const Client = new EntitySchema({
  name: 'Client',
  tableName: 'clients',
  columns: {
    id: { type: Number, primary: true, generated: true },
    fullName: { type: String, length: 160 },
    email: { type: String, length: 160, unique: true },
    phone: { type: String, length: 32 },
    city: { type: String, length: 100 },
    createdAt: { type: Date, createDate: true }
  },
  relations: {
    tickets: {
      type: 'one-to-many',
      target: 'Ticket',
      inverseSide: 'client'
    }
  },
  indices: [{ columns: ['city'] }]
});
