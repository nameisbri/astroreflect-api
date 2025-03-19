import { Router } from "express";
import ephemerisRoutes from "./ephemerisRoutes";
import journalRoutes from "./journalRoutes";

const router = Router();

router.use("/ephemeris", ephemerisRoutes);
router.use("/journal", journalRoutes);

export default router;
