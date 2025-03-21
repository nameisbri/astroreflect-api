import { Request, Response } from "express";
import {
  getPlanetPosition,
  getEnhancedPlanetPosition,
} from "../services/ephemeris/ephemerisService";
import { findTransitsInRange } from "../services/ephemeris/transitService";
import { getSampleTransits } from "../services/ephemeris/transitService";
import { Planet } from "../models/types";

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
    const dateParam = (req.query.date as string) || new Date().toISOString();
    const planetParam = req.query.planet as string;

    // Validate date
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    // Validate planet
    const planet = Object.values(Planet).find(
      (p) => p.toLowerCase() === planetParam.toLowerCase()
    );

    if (!planet) {
      res.status(400).json({
        error: "Invalid planet",
        validPlanets: Object.values(Planet),
      });
      return;
    }

    // Calculate position
    const position = getPlanetPosition(planet, date);
    res.json({ position });
  } catch (error) {
    console.error("Planet position error:", error);
    res.status(500).json({
      error: "Failed to get planet position",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// In ephemerisController.ts
export function getDailySnapshot(req: Request, res: Response): void {
  try {
    const dateParam = (req.query.date as string) || new Date().toISOString();

    // Validate date
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    // Get planet positions with house info for all planets
    const planets = Object.values(Planet);
    const positions = planets.map((planet) =>
      getEnhancedPlanetPosition(planet, date)
    );

    // Get transits for this day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transits = findTransitsInRange(startDate, endDate);

    res.json({
      date: date.toISOString(),
      positions,
      transits,
    });
  } catch (error) {
    console.error("Daily snapshot error:", error);
    res.status(500).json({
      error: "Failed to get daily planetary snapshot",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
