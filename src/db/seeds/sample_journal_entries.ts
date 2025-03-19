import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex('journal_entries').del();

  // Insert seed entries
  await knex('journal_entries').insert([
    {
      id: uuidv4(),
      transit_id: uuidv4(),
      content: 'Sample journal entry 1 for Mercury square Saturn transit.',
      mood: 'Reflective',
      tags: ['career', 'challenge'],
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      transit_id: uuidv4(),
      content: 'Sample journal entry 2 for Venus trine Jupiter transit.',
      mood: 'Optimistic',
      tags: ['relationships', 'opportunity'],
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}