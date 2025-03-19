import { Router } from "express";
import {
  createEntry,
  getEntriesForTransit,
  getRecentEntries,
} from "../controllers/journalController";

const router = Router();

router.post("/entries", createEntry);
router.get("/entries/transit/:transitId", getEntriesForTransit);
router.get("/entries/recent", getRecentEntries);

export default router;
