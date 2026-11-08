import { EntitySchema } from 'typeorm';

export const Location = new EntitySchema({
  name: 'Location',
  tableName: 'locations',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, length: 160 },
    city: { type: String, length: 100 },
    address: { type: String, length: 255 },
    capacity: { type: Number },
    createdAt: { type: Date, createDate: true }
  },
  relations: {
    events: {
      type: 'one-to-many',
      target: 'Event',
      inverseSide: 'location'
    }
  },
  indices: [{ columns: ['city'] }]
});
