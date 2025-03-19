import sweph from "sweph";
import path from "path";
import { Planet, PlanetPosition } from "../../models/types";

// Initialize Swiss Ephemeris
const ephemerisPath = path.join(__dirname, "../../../ephemeris-data");
sweph.set_ephe_path(ephemerisPath);

// Map planets to Swiss Ephemeris planet IDs
// Check what constants are available in the sweph module
// Use numeric IDs if the named constants aren't available
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

/**
 * Calculate planetary position for a given date
 */
export function getPlanetPosition(planet: Planet, date: Date): PlanetPosition {
  // Convert date to Julian day
  const julianDay = sweph.julday(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours() + date.getMinutes() / 60
  );

  // Get planet position
  const planetId = PLANET_MAP[planet];
  const result = sweph.calc_ut(julianDay, planetId, sweph.FLG_SWIEPH);

  return {
    longitude: result[0],
    latitude: result[1],
    distance: result[2],
    speed: result[3],
  };
}
