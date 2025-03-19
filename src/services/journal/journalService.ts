import { v4 as uuidv4 } from "uuid";
import db from "../../config/database";
import { JournalEntry } from "../../models/types";

interface CreateJournalEntryParams {
  transitId: string;
  transitTypeId: string; // Added this field
  content: string;
  mood?: string;
  tags?: string[];
}

interface GetJournalEntriesParams {
  transitId?: string;
  transitTypeId?: string; // Added this field
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Creates a new journal entry
 */
export async function createJournalEntry(
  entry: CreateJournalEntryParams
): Promise<JournalEntry> {
  try {
    const now = new Date();
    const [journalEntry] = await db("journal_entries")
      .insert({
        id: uuidv4(),
        transit_id: entry.transitId,
        transit_type_id: entry.transitTypeId, // Added this field
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    return mapDatabaseEntryToJournalEntry(journalEntry);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw new Error("Failed to create journal entry");
  }
}

/**
 * Updates an existing journal entry
 */
export async function updateJournalEntry(
  id: string,
  entry: Partial<Omit<CreateJournalEntryParams, "transitTypeId">>
): Promise<JournalEntry> {
  try {
    const now = new Date();
    const updateData: any = {
      updated_at: now,
    };

    if (entry.transitId !== undefined) updateData.transit_id = entry.transitId;
    if (entry.content !== undefined) updateData.content = entry.content;
    if (entry.mood !== undefined) updateData.mood = entry.mood;
    if (entry.tags !== undefined) updateData.tags = entry.tags;

    const [journalEntry] = await db("journal_entries")
      .where({ id })
      .update(updateData)
      .returning("*");

    if (!journalEntry) {
      throw new Error("Journal entry not found");
    }

    return mapDatabaseEntryToJournalEntry(journalEntry);
  } catch (error) {
    console.error(`Error updating journal entry ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a journal entry
 */
export async function deleteJournalEntry(id: string): Promise<boolean> {
  try {
    const result = await db("journal_entries").where({ id }).delete();
    return result > 0;
  } catch (error) {
    console.error(`Error deleting journal entry ${id}:`, error);
    throw new Error("Failed to delete journal entry");
  }
}

/**
 * Gets a journal entry by ID
 */
export async function getJournalEntryById(
  id: string
): Promise<JournalEntry | null> {
  try {
    const journalEntry = await db("journal_entries").where({ id }).first();
    return journalEntry ? mapDatabaseEntryToJournalEntry(journalEntry) : null;
  } catch (error) {
    console.error(`Error retrieving journal entry ${id}:`, error);
    throw new Error("Failed to retrieve journal entry");
  }
}

/**
 * Gets journal entries with optional filtering
 */
export async function getJournalEntries(
  params: GetJournalEntriesParams = {}
): Promise<JournalEntry[]> {
  try {
    const query = db("journal_entries");

    // Apply filters
    if (params.transitId) {
      query.where("transit_id", params.transitId);
    }

    // Filter by transit type ID
    if (params.transitTypeId) {
      query.where("transit_type_id", params.transitTypeId);
    }

    if (params.startDate) {
      query.where("created_at", ">=", params.startDate);
    }

    if (params.endDate) {
      query.where("created_at", "<=", params.endDate);
    }

    if (params.tags && params.tags.length > 0) {
      // Filter for entries that have ANY of the specified tags
      query.whereRaw("?? && ?::text[]", ["tags", params.tags]);
    }

    // Order by creation date, newest first
    query.orderBy("created_at", "desc");

    // Pagination
    if (params.limit !== undefined) {
      query.limit(params.limit);
    }

    if (params.offset !== undefined) {
      query.offset(params.offset);
    }

    const journalEntries = await query;
    return journalEntries.map(mapDatabaseEntryToJournalEntry);
  } catch (error) {
    console.error("Error retrieving journal entries:", error);
    throw new Error("Failed to retrieve journal entries");
  }
}

/**
 * Gets recent journal entries
 */
export async function getRecentJournalEntries(
  limit: number = 5
): Promise<JournalEntry[]> {
  return getJournalEntries({ limit });
}

/**
 * Gets journal entries for a specific transit
 */
export async function getJournalEntriesForTransit(
  transitId: string
): Promise<JournalEntry[]> {
  return getJournalEntries({ transitId });
}

/**
 * Gets journal entries for a specific transit type (across time)
 */
export async function getJournalEntriesForTransitType(
  transitTypeId: string,
  limit: number = 50
): Promise<JournalEntry[]> {
  return getJournalEntries({ transitTypeId, limit });
}

/**
 * Gets journal entries by tag
 */
export async function getJournalEntriesByTag(
  tag: string,
  limit: number = 20
): Promise<JournalEntry[]> {
  return getJournalEntries({ tags: [tag], limit });
}

/**
 * Search journal entries by content
 */
export async function searchJournalEntries(
  searchTerm: string,
  limit: number = 20
): Promise<JournalEntry[]> {
  try {
    const journalEntries = await db("journal_entries")
      .whereRaw("content ILIKE ?", [`%${searchTerm}%`])
      .orWhereRaw("? = ANY(tags)", [searchTerm])
      .orWhere("mood", "ILIKE", `%${searchTerm}%`)
      .orderBy("created_at", "desc")
      .limit(limit);

    return journalEntries.map(mapDatabaseEntryToJournalEntry);
  } catch (error) {
    console.error("Error searching journal entries:", error);
    throw new Error("Failed to search journal entries");
  }
}

/**
 * Utility function to map database entry to JournalEntry type
 */
function mapDatabaseEntryToJournalEntry(dbEntry: any): JournalEntry {
  return {
    id: dbEntry.id,
    transitId: dbEntry.transit_id,
    transitTypeId: dbEntry.transit_type_id, // Added this field
    content: dbEntry.content,
    mood: dbEntry.mood || undefined,
    tags: dbEntry.tags || [],
    createdAt: new Date(dbEntry.created_at),
    updatedAt: new Date(dbEntry.updated_at),
  };
}
