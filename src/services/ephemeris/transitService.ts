import { v4 as uuidv4 } from "uuid";
import { Planet, Aspect, Transit } from "../../models/types";
import { getPlanetPosition } from "./ephemerisService";

// Define aspect angles
const ASPECT_ANGLES = {
  [Aspect.CONJUNCTION]: 0,
  [Aspect.SEXTILE]: 60,
  [Aspect.SQUARE]: 90,
  [Aspect.TRINE]: 120,
  [Aspect.OPPOSITION]: 180,
};

/**
 * Check if two planetary positions form an aspect
 */
export function checkAspect(
  pos1: number,
  pos2: number,
  aspect: Aspect,
  orb: number = 2
): boolean {
  const targetAngle = ASPECT_ANGLES[aspect];
  const angleDiff = Math.abs(((pos1 - pos2 + 180) % 360) - 180);
  return Math.abs(angleDiff - targetAngle) <= orb;
}

/**
 * Generate a description for a transit
 */
export function generateTransitDescription(
  planetA: Planet,
  aspect: Aspect,
  planetB: Planet
): string {
  // Simple descriptions - would be more detailed in a full implementation
  const templates = {
    [Aspect.CONJUNCTION]: `${planetA} conjunct ${planetB} brings a fusion of energies. This is a time when these planetary influences blend together, creating new beginnings and emphases in areas related to both planets.`,
    [Aspect.SQUARE]: `${planetA} square ${planetB} creates tension and challenges. This aspect represents friction between these planetary energies, which can generate stress but also motivate growth and change.`,
    [Aspect.TRINE]: `${planetA} trine ${planetB} forms a harmonious flow. This supportive aspect brings ease and natural opportunities between these planetary energies.`,
    [Aspect.OPPOSITION]: `${planetA} opposite ${planetB} creates polarization. This aspect brings awareness through contrast and can represent a need to balance these different planetary energies.`,
    [Aspect.SEXTILE]: `${planetA} sextile ${planetB} presents positive opportunities. This aspect offers supportive energy that requires some initiative to fully utilize.`,
  };

  return (
    templates[aspect] ||
    `${planetA} ${aspect} ${planetB}: The qualities of these planets interact in ways that affect your life and consciousness.`
  );
}

/**
 * Get sample transits for a specific date
 * This is a simplified implementation - a real one would search across date ranges
 */
export function getSampleTransits(date: Date, orb: number = 2): Transit[] {
  const transits: Transit[] = [];
  const planets = Object.values(Planet);
  const aspects = Object.values(Aspect);

  // Just check for aspects between planets on this specific date
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];

      const posA = getPlanetPosition(planetA, date);
      const posB = getPlanetPosition(planetB, date);

      for (const aspect of aspects) {
        if (checkAspect(posA.longitude, posB.longitude, aspect, orb)) {
          // For simplicity, use same date for start/exact/end
          // In a real implementation, you'd calculate these precisely
          transits.push({
            id: uuidv4(),
            planetA,
            planetB,
            aspect,
            exactDate: new Date(date),
            startDate: new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before
            endDate: new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after
            description: generateTransitDescription(planetA, aspect, planetB),
          });
        }
      }
    }
  }

  return transits;
}

/**
 * Calculate transits for a date range - more advanced implementation
 * This is pseudocode for a more complete implementation
 */
export function findTransitsInRange(
  startDate: Date,
  endDate: Date,
  orb: number = 2
): Transit[] {
  // Real implementation would be much more complex
  // For now, just return sample transits from the midpoint of the range
  const midpointTime = (startDate.getTime() + endDate.getTime()) / 2;
  const midpointDate = new Date(midpointTime);

  return getSampleTransits(midpointDate, orb);

  /* Full implementation would be something like:
  
  const transits = [];
  const planets = Object.values(Planet);
  const aspects = Object.values(Aspect);
  
  // Create a series of sample points within the date range
  const samplePoints = [];
  const dayInMs = 24 * 60 * 60 * 1000;
  for (let time = startDate.getTime(); time <= endDate.getTime(); time += dayInMs) {
    samplePoints.push(new Date(time));
  }
  
  // For each planet pair and aspect
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      
      for (const aspect of aspects) {
        let inAspect = false;
        let aspectStartDate = null;
        
        // Check each sample point
        for (let k = 0; k < samplePoints.length; k++) {
          const date = samplePoints[k];
          const posA = getPlanetPosition(planetA, date);
          const posB = getPlanetPosition(planetB, date);
          
          const hasAspect = checkAspect(posA.longitude, posB.longitude, aspect, orb);
          
          if (hasAspect && !inAspect) {
            // Entering aspect
            inAspect = true;
            aspectStartDate = date;
          } else if (!hasAspect && inAspect && aspectStartDate) {
            // Leaving aspect, create transit
            inAspect = false;
            
            // Find exact date
            const exactDate = findExactAspectDate(planetA, planetB, aspect, aspectStartDate, date);
            
            transits.push({
              id: uuidv4(),
              planetA,
              planetB,
              aspect,
              exactDate,
              startDate: aspectStartDate,
              endDate: date,
              description: generateTransitDescription(planetA, aspect, planetB)
            });
          }
        }
      }
    }
  }
  
  return transits;
  */
}

// Helper function to find the exact date of an aspect (commented out for now)
/*
function findExactAspectDate(
  planetA: Planet,
  planetB: Planet,
  aspect: Aspect,
  startDate: Date,
  endDate: Date
): Date {
  // Binary search to find the exact date
  // ...implementation would go here
  
  // For now, return the midpoint
  return new Date((startDate.getTime() + endDate.getTime()) / 2);
}
*/
