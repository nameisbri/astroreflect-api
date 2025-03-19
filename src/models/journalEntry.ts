import db from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface JournalEntryRecord {
  id: string;
  transit_id: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateJournalEntryParams {
  transitId: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export async function createJournalEntry(
  entry: CreateJournalEntryParams
): Promise<JournalEntryRecord> {
  const [record] = await db("journal_entries")
    .insert({
      id: uuidv4(),
      transit_id: entry.transitId,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
    })
    .returning("*");

  return record;
}

export async function getJournalEntriesForTransit(
  transitId: string
): Promise<JournalEntryRecord[]> {
  return db("journal_entries")
    .where({ transit_id: transitId })
    .orderBy("created_at", "desc");
}

export async function getRecentJournalEntries(
  limit: number = 5
): Promise<JournalEntryRecord[]> {
  return db("journal_entries").orderBy("created_at", "desc").limit(limit);
}
