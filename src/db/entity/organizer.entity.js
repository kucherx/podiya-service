import { EntitySchema } from 'typeorm';

export const Organizer = new EntitySchema({
  name: 'Organizer',
  tableName: 'organizers',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, length: 160 },
    email: { type: String, length: 160, unique: true },
    phone: { type: String, length: 32 },
    website: { type: String, length: 255, nullable: true },
    description: { type: 'text', nullable: true },
    createdAt: { type: Date, createDate: true }
  },
  relations: {
    events: {
      type: 'one-to-many',
      target: 'Event',
      inverseSide: 'organizer'
    }
  }
});
