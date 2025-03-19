import { Router } from "express";
import {
  createEntry,
  getEntriesForTransit,
  getEntriesForTransitType,
  getRecentEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getEntriesByTag,
  searchEntries,
} from "../controllers/journalController";

const router = Router();

// Create a new journal entry
router.post("/entries", createEntry);

// Get entries for a specific transit
router.get("/entries/transit/:transitId", getEntriesForTransit);

// Get entries for a transit type (across time)
router.get("/entries/transit-type/:transitTypeId", getEntriesForTransitType);

// Get recent entries
router.get("/entries/recent", getRecentEntries);

// Get entries by tag
router.get("/entries/tag/:tag", getEntriesByTag);

// Search entries
router.get("/entries/search", searchEntries);

// Get, update, delete a specific entry
router.get("/entries/:entryId", getEntry);
router.put("/entries/:entryId", updateEntry);
router.delete("/entries/:entryId", deleteEntry);

export default router;
