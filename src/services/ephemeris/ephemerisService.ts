import sweph from "sweph";
import { Planet, PlanetPosition, Aspect } from "../../models/types";
import path from "path";

// Initialize Swiss Ephemeris
const ephemerisPath = path.join(__dirname, "../../../ephemeris-data");
sweph.set_ephe_path(ephemerisPath);

// Map planets to Swiss Ephemeris planet IDs
const PLANET_MAP = {
  [Planet.SUN]: 0, // SE_SUN
  [Planet.MOON]: 1, // SE_MOON
  [Planet.MERCURY]: 2, // SE_MERCURY
  [Planet.VENUS]: 3, // SE_VENUS
  [Planet.MARS]: 4, // SE_MARS
  [Planet.JUPITER]: 5, // SE_JUPITER
  [Planet.SATURN]: 6, // SE_SATURN
  [Planet.URANUS]: 7, // SE_URANUS
  [Planet.NEPTUNE]: 8, // SE_NEPTUNE
  [Planet.PLUTO]: 9, // SE_PLUTO
};

// Zodiac Signs with their ruling planets and element
const ZODIAC_SIGNS = [
  { name: "Aries", ruler: Planet.MARS, element: "Fire", start: 0, end: 30 },
  { name: "Taurus", ruler: Planet.VENUS, element: "Earth", start: 30, end: 60 },
  { name: "Gemini", ruler: Planet.MERCURY, element: "Air", start: 60, end: 90 },
  { name: "Cancer", ruler: Planet.MOON, element: "Water", start: 90, end: 120 },
  { name: "Leo", ruler: Planet.SUN, element: "Fire", start: 120, end: 150 },
  {
    name: "Virgo",
    ruler: Planet.MERCURY,
    element: "Earth",
    start: 150,
    end: 180,
  },
  { name: "Libra", ruler: Planet.VENUS, element: "Air", start: 180, end: 210 },
  {
    name: "Scorpio",
    ruler: Planet.PLUTO,
    element: "Water",
    start: 210,
    end: 240,
  },
  {
    name: "Sagittarius",
    ruler: Planet.JUPITER,
    element: "Fire",
    start: 240,
    end: 270,
  },
  {
    name: "Capricorn",
    ruler: Planet.SATURN,
    element: "Earth",
    start: 270,
    end: 300,
  },
  {
    name: "Aquarius",
    ruler: Planet.URANUS,
    element: "Air",
    start: 300,
    end: 330,
  },
  {
    name: "Pisces",
    ruler: Planet.NEPTUNE,
    element: "Water",
    start: 330,
    end: 360,
  },
];

// Gregorian flag for Julian day conversion
const GREG_FLAG = 1;

// SEFLG_SWIEPH = 2 (Swiss Ephemeris flag)
const CALC_FLAG = 2 | 256; // Added SEFLG_SPEED flag to get planet speed

/**
 * Determine if a planet is in retrograde motion
 * @param planet Planet being checked
 * @param longitude Current longitude
 * @param speedLong Longitudinal speed
 * @returns Retrograde status details
 */
function getRetrogadeStatus(
  planet: Planet,
  longitude: number,
  speedLong: number
) {
  // Specific thresholds and detection for different planets
  switch (planet) {
    case Planet.MERCURY:
      return {
        isRetrograde: speedLong < -0.1, // More precise for Mercury
        status: speedLong < -0.1 ? "Retrograde" : "Direct",
        speed: Math.abs(speedLong),
      };
    case Planet.VENUS:
      return {
        isRetrograde: speedLong < -0.05,
        status: speedLong < -0.05 ? "Retrograde" : "Direct",
        speed: Math.abs(speedLong),
      };
    case Planet.MARS:
      return {
        isRetrograde: speedLong < -0.05,
        status: speedLong < -0.05 ? "Retrograde" : "Direct",
        speed: Math.abs(speedLong),
      };
    default:
      // For outer planets
      return {
        isRetrograde: speedLong < 0,
        status: speedLong < 0 ? "Retrograde" : "Direct",
        speed: Math.abs(speedLong),
      };
  }
}

/**
 * Calculate the zodiac sign based on longitude
 * @param longitude Celestial longitude in degrees
 * @returns Detailed sign information
 */
function calculateSignInfo(longitude: number) {
  const normLongitude = longitude % 360;
  const signInfo = ZODIAC_SIGNS.find(
    (sign) => normLongitude >= sign.start && normLongitude < sign.end
  );

  if (!signInfo) throw new Error("Unable to determine sign");

  return {
    name: signInfo.name,
    ruler: signInfo.ruler,
    element: signInfo.element,
    degreeInSign: normLongitude % 30,
    percentInSign: ((normLongitude % 30) / 30) * 100,
  };
}

/**
 * Calculate planetary position for a given date
 */
export function getPlanetPosition(planet: Planet, date: Date) {
  try {
    // Convert date to Julian day
    const julianDay = sweph.julday(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours() + date.getMinutes() / 60,
      GREG_FLAG
    );

    // Get planet ID
    const planetId = PLANET_MAP[planet];

    // Calculate planet position with speed
    const result = sweph.calc_ut(julianDay, planetId, CALC_FLAG);

    // Validate result
    if (!result || typeof result !== "object" || !result.data) {
      throw new Error("Invalid result from sweph.calc_ut");
    }

    // Log full result for debugging
    console.log("Full planetary calculation result:", result);

    // Destructure data
    const [
      longitude,
      latitude,
      distance,
      speedLong,
      longitudeSpeed,
      latitudeSpeed,
    ] = result.data;

    // Comprehensive planet information
    return {
      planet,
      longitude,
      latitude,
      distance,
      speed: speedLong, // Use longitudinal speed
      speedDetails: {
        longitude: longitudeSpeed,
        latitude: latitudeSpeed,
      },

      // Sign Information
      sign: calculateSignInfo(longitude),

      // Retrograde Details
      retrograde: getRetrogadeStatus(planet, longitude, speedLong),

      // Context and Interpretation
      interpretation: {
        keyThemes: getSignInterpretation(
          calculateSignInfo(longitude).name,
          planet
        ),
        challenges: getSignChallenges(
          calculateSignInfo(longitude).name,
          planet
        ),
        opportunities: getSignOpportunities(
          calculateSignInfo(longitude).name,
          planet
        ),
      },
    };
  } catch (error) {
    console.error("Error in getPlanetPosition:", error);
    throw error;
  }
}

// Placeholder interpretation functions (to be expanded)
function getSignInterpretation(sign: string, planet: Planet): string[] {
  return ["Personal growth", "Unique expression", "Transformative energy"];
}

function getSignChallenges(sign: string, planet: Planet): string[] {
  return [
    "Potential for impulsive behavior",
    "Need for patience",
    "Balancing personal desires",
  ];
}

function getSignOpportunities(sign: string, planet: Planet): string[] {
  return ["Personal transformation", "Creative expression", "Emotional growth"];
}

export interface EnhancedPlanetPosition extends PlanetPosition {
  house: {
    number: number;
    cusp: number;
    ruler: Planet;
    entryDate: Date;
    exitDate: Date;
  };
  signDuration: {
    entryDate: Date;
    exitDate: Date;
  };
}

// In ephemerisService.ts
export function getEnhancedPlanetPosition(
  planet: Planet,
  date: Date
): EnhancedPlanetPosition {
  // Get basic planet position
  const position = getPlanetPosition(planet, date);

  // Calculate house placement
  const houseInfo = calculateHousePlacement(position.longitude, date);

  // Calculate sign duration
  const signDuration = calculateSignDuration(planet, position.sign.name, date);

  return {
    ...position,
    house: houseInfo,
    signDuration,
  };
}

function calculateHousePlacement(longitude: number, date: Date) {
  // Here we would implement house calculation logic
  // This requires birth time and location for a fully accurate chart
  // For a simplified version, we can use whole sign houses based on the Ascendant

  // For now, return placeholder data
  return {
    number: Math.floor((longitude % 360) / 30) + 1,
    cusp: Math.floor(longitude / 30) * 30,
    ruler: getHouseRuler(Math.floor((longitude % 360) / 30) + 1),
    entryDate: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000), // Placeholder
    exitDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), // Placeholder
  };
}

function calculateSignDuration(planet: Planet, sign: string, date: Date) {
  // Determine when the planet entered and will exit this sign
  // This requires calculating the planet's position on multiple dates

  // For now, return placeholder data
  const entryDate = new Date(date.getTime() - 15 * 24 * 60 * 60 * 1000);
  const exitDate = new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000);

  // For actual implementation, we would need to search backward and forward
  // for the dates when the planet's position crosses sign boundaries

  return {
    entryDate,
    exitDate,
  };
}

function getHouseRuler(houseNumber: number): Planet {
  // Traditional rulership assignments
  const rulers = [
    Planet.MARS, // 1st house - Aries
    Planet.VENUS, // 2nd house - Taurus
    Planet.MERCURY, // 3rd house - Gemini
    Planet.MOON, // 4th house - Cancer
    Planet.SUN, // 5th house - Leo
    Planet.MERCURY, // 6th house - Virgo
    Planet.VENUS, // 7th house - Libra
    Planet.PLUTO, // 8th house - Scorpio
    Planet.JUPITER, // 9th house - Sagittarius
    Planet.SATURN, // 10th house - Capricorn
    Planet.URANUS, // 11th house - Aquarius
    Planet.NEPTUNE, // 12th house - Pisces
  ];

  return rulers[houseNumber - 1];
}
