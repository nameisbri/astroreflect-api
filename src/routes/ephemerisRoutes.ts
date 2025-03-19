import { Router } from "express";
import {
  getTransits,
  getPlanetPositionData,
} from "../controllers/ephemerisController";

const router = Router();

router.get("/transits", getTransits);
router.get("/planet", getPlanetPositionData);

export default router;
