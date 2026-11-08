import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: Number, primary: true, generated: true },
    email: { type: String, length: 160, unique: true },
    passwordHash: { type: String, length: 255 },
    role: { type: String, length: 20, default: 'client' },
    createdAt: { type: Date, createDate: true },
    updatedAt: { type: Date, updateDate: true }
  },
  relations: {
    client: {
      type: 'many-to-one',
      target: 'Client',
      inverseSide: 'users',
      joinColumn: { name: 'client_id' },
      nullable: true,
      onDelete: 'CASCADE'
    },
    organizer: {
      type: 'many-to-one',
      target: 'Organizer',
      inverseSide: 'users',
      joinColumn: { name: 'organizer_id' },
      nullable: true,
      onDelete: 'CASCADE'
    }
  },
  indices: [{ columns: ['role'] }]
});
