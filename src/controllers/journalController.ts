import { Request, Response } from "express";
import {
  createJournalEntry,
  getJournalEntriesForTransit,
  getJournalEntriesForTransitType,
  getRecentJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntriesByTag,
  searchJournalEntries,
} from "../models/journalEntry";
import { getTransitTypeById } from "../services/ephemeris/transitTypeService";

export async function createEntry(req: Request, res: Response): Promise<void> {
  try {
    const { transitId, transitTypeId, content, mood, tags } = req.body;

    if (!transitId || !transitTypeId || !content) {
      res
        .status(400)
        .json({
          error: "Transit ID, transit type ID, and content are required",
        });
      return;
    }

    const entry = await createJournalEntry({
      transitId,
      transitTypeId,
      content,
      mood,
      tags,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({
      error: "Failed to create journal entry",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEntriesForTransit(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { transitId } = req.params;
    const entries = await getJournalEntriesForTransit(transitId);
    res.json({ entries });
  } catch (error) {
    console.error("Error fetching entries for transit:", error);
    res.status(500).json({
      error: "Failed to fetch journal entries",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEntriesForTransitType(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { transitTypeId } = req.params;

    // Get the transit type details
    const transitType = getTransitTypeById(transitTypeId);
    if (!transitType) {
      res.status(404).json({ error: "Transit type not found" });
      return;
    }

    // Get journal entries for this transit type
    const entries = await getJournalEntriesForTransitType(transitTypeId);

    res.json({
      transitType,
      entries,
    });
  } catch (error) {
    console.error("Error fetching entries for transit type:", error);
    res.status(500).json({
      error: "Failed to fetch journal entries",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getRecentEntries(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const entries = await getRecentJournalEntries(limit);
    res.json({ entries });
  } catch (error) {
    console.error("Error fetching recent entries:", error);
    res.status(500).json({
      error: "Failed to fetch recent journal entries",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEntry(req: Request, res: Response): Promise<void> {
  try {
    const { entryId } = req.params;
    const entry = await getJournalEntryById(entryId);

    if (!entry) {
      res.status(404).json({ error: "Journal entry not found" });
      return;
    }

    res.json(entry);
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({
      error: "Failed to fetch journal entry",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateEntry(req: Request, res: Response): Promise<void> {
  try {
    const { entryId } = req.params;
    const { content, mood, tags } = req.body;

    // Check if entry exists
    const existingEntry = await getJournalEntryById(entryId);
    if (!existingEntry) {
      res.status(404).json({ error: "Journal entry not found" });
      return;
    }

    // Update the entry
    const updatedEntry = await updateJournalEntry(entryId, {
      content,
      mood,
      tags,
    });

    res.json(updatedEntry);
  } catch (error) {
    console.error("Error updating journal entry:", error);
    res.status(500).json({
      error: "Failed to update journal entry",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteEntry(req: Request, res: Response): Promise<void> {
  try {
    const { entryId } = req.params;

    // Check if entry exists
    const existingEntry = await getJournalEntryById(entryId);
    if (!existingEntry) {
      res.status(404).json({ error: "Journal entry not found" });
      return;
    }

    // Delete the entry
    const deleted = await deleteJournalEntry(entryId);

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    res.status(500).json({
      error: "Failed to delete journal entry",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEntriesByTag(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { tag } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const entries = await getJournalEntriesByTag(tag, limit);

    res.json({ entries });
  } catch (error) {
    console.error("Error fetching entries by tag:", error);
    res.status(500).json({
      error: "Failed to fetch journal entries by tag",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function searchEntries(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const entries = await searchJournalEntries(query, limit);

    res.json({ entries });
  } catch (error) {
    console.error("Error searching journal entries:", error);
    res.status(500).json({
      error: "Failed to search journal entries",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
