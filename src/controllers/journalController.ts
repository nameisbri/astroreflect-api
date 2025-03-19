import { Request, Response } from "express";
import {
  createJournalEntry,
  getJournalEntriesForTransit,
  getRecentJournalEntries,
} from "../models/journalEntry";

export async function createEntry(req: Request, res: Response): Promise<void> {
  try {
    const { transitId, content, mood, tags } = req.body;

    if (!transitId || !content) {
      res.status(400).json({ error: "Transit ID and content are required" });
      return;
    }

    const entry = await createJournalEntry({
      transitId,
      content,
      mood,
      tags,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to create journal entry" });
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
    res.status(500).json({ error: "Failed to fetch journal entries" });
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
    res.status(500).json({ error: "Failed to fetch recent journal entries" });
  }
}
