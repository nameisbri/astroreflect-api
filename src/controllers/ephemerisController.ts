import { Request, Response } from "express";
import { getPlanetPosition } from "../services/ephemeris/ephemerisService";
import { getSampleTransits } from "../services/ephemeris/transitService";

export function getTransits(req: Request, res: Response): void {
  try {
    const date = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date();

    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    const transits = getSampleTransits(date);
    res.json({ transits });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate transits" });
  }
}

export function getPlanetPositionData(req: Request, res: Response): void {
  try {
    const date = new Date((req.query.date as string) || new Date());
    const planet = req.query.planet as string;

    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    const position = getPlanetPosition(planet as any, date);
    res.json({ position });
  } catch (error) {
    res.status(500).json({ error: "Failed to get planet position" });
  }
}
