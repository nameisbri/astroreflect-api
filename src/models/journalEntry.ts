import db from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface JournalEntryRecord {
  id: string;
  transit_id: string;
  transit_type_id: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateJournalEntryParams {
  transitId: string;
  transitTypeId: string;
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
      transit_type_id: entry.transitTypeId,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      created_at: new Date(),
      updated_at: new Date(),
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

export async function getJournalEntriesForTransitType(
  transitTypeId: string
): Promise<JournalEntryRecord[]> {
  return db("journal_entries")
    .where({ transit_type_id: transitTypeId })
    .orderBy("created_at", "desc");
}

export async function getRecentJournalEntries(
  limit: number = 5
): Promise<JournalEntryRecord[]> {
  return db("journal_entries").orderBy("created_at", "desc").limit(limit);
}

export async function getJournalEntryById(
  id: string
): Promise<JournalEntryRecord | undefined> {
  return db("journal_entries").where({ id }).first();
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<
    Omit<CreateJournalEntryParams, "transitId" | "transitTypeId">
  >
): Promise<JournalEntryRecord | null> {
  const [record] = await db("journal_entries")
    .where({ id })
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .returning("*");

  return record || null;
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  const deleted = await db("journal_entries").where({ id }).delete();

  return deleted > 0;
}

export async function getJournalEntriesByTag(
  tag: string,
  limit: number = 20
): Promise<JournalEntryRecord[]> {
  return db("journal_entries")
    .whereRaw("? = ANY(tags)", [tag])
    .orderBy("created_at", "desc")
    .limit(limit);
}

export async function searchJournalEntries(
  searchTerm: string,
  limit: number = 20
): Promise<JournalEntryRecord[]> {
  return db("journal_entries")
    .whereRaw("content ILIKE ?", [`%${searchTerm}%`])
    .orWhereRaw("? = ANY(tags)", [searchTerm])
    .orWhere("mood", "ILIKE", `%${searchTerm}%`)
    .orderBy("created_at", "desc")
    .limit(limit);
}
