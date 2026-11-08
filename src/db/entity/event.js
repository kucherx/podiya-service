import { EntitySchema } from 'typeorm';

export const Event = new EntitySchema({
  name: 'Event',
  tableName: 'events',
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String, length: 200 },
    description: { type: 'text' },
    startsAt: { type: 'datetime' },
    endsAt: { type: 'datetime' },
    status: { type: String, length: 32, default: 'draft' },
    createdAt: { type: Date, createDate: true },
    updatedAt: { type: Date, updateDate: true }
  },
  relations: {
    location: {
      type: 'many-to-one',
      target: 'Location',
      inverseSide: 'events',
      joinColumn: { name: 'location_id' },
      nullable: false,
      onDelete: 'RESTRICT'
    },
    organizer: {
      type: 'many-to-one',
      target: 'Organizer',
      inverseSide: 'events',
      joinColumn: { name: 'organizer_id' },
      nullable: false,
      onDelete: 'RESTRICT'
    },
    categories: {
      type: 'many-to-many',
      target: 'TicketCategory',
      inverseSide: 'events',
      joinTable: {
        name: 'event_categories',
        joinColumn: { name: 'event_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
      }
    },
    tickets: {
      type: 'one-to-many',
      target: 'Ticket',
      inverseSide: 'event'
    }
  },
  indices: [
    { columns: ['startsAt'] },
    { columns: ['status'] }
  ]
});
