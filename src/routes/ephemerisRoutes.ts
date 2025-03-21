import { Router } from "express";
import {
  getTransits,
  getPlanetPositionData,
  getDailySnapshot,
} from "../controllers/ephemerisController";

const router = Router();

router.get("/transits", getTransits);
router.get("/planet", getPlanetPositionData);
router.get("/daily-snapshot", getDailySnapshot);

export default router;
