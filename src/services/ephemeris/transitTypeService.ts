import {
  Planet,
  Aspect,
  TransitType,
  TransitSubtype,
  ZodiacSign,
} from "../../models/types";

/**
 * Generate a consistent ID for a transit type
 */
export function generateTransitTypeId(
  planetA: Planet,
  planetB?: Planet,
  aspect?: Aspect,
  sign?: ZodiacSign,
  subtype: TransitSubtype = TransitSubtype.STANDARD
): string {
  // Handle retrograde and other single-planet transits
  if (subtype === TransitSubtype.RETROGRADE) {
    return `${planetA}_RETROGRADE`;
  }

  if (subtype === TransitSubtype.STATION) {
    return `${planetA}_STATION`;
  }

  // Handle sign ingress
  if (subtype === TransitSubtype.INGRESS && sign) {
    return `${planetA}_INGRESS_${sign}`;
  }

  // Handle transit through a sign
  if (subtype === TransitSubtype.TRANSIT && sign) {
    return `${planetA}_IN_${sign}`;
  }

  // For regular aspects between two planets
  if (planetB && aspect) {
    // Sort planets alphabetically to ensure the same ID regardless of order
    const planets = [planetA, planetB].sort();
    return `${planets[0]}_${aspect}_${planets[1]}`;
  }

  throw new Error("Invalid transit type parameters");
}

/**
 * Generate a human-readable name for a transit type
 */
export function generateTransitTypeName(
  planetA: Planet,
  planetB?: Planet,
  aspect?: Aspect,
  sign?: ZodiacSign,
  subtype: TransitSubtype = TransitSubtype.STANDARD
): string {
  // Handle retrograde and other single-planet transits
  if (subtype === TransitSubtype.RETROGRADE) {
    return `${planetA} Retrograde`;
  }

  if (subtype === TransitSubtype.STATION) {
    return `${planetA} Station`;
  }

  // Handle sign ingress
  if (subtype === TransitSubtype.INGRESS && sign) {
    return `${planetA} enters ${sign}`;
  }

  // Handle transit through a sign
  if (subtype === TransitSubtype.TRANSIT && sign) {
    return `${planetA} in ${sign}`;
  }

  // For regular aspects between two planets
  if (planetB && aspect) {
    return `${planetA} ${aspect} ${planetB}`;
  }

  throw new Error("Invalid transit type parameters");
}

/**
 * Generate a description for a transit type
 */
function generateTransitTypeDescription(
  planetA: Planet,
  planetB?: Planet,
  aspect?: Aspect,
  sign?: ZodiacSign,
  subtype: TransitSubtype = TransitSubtype.STANDARD
): string {
  // Handle retrograde
  if (subtype === TransitSubtype.RETROGRADE) {
    return `${planetA} appears to move backward from Earth's perspective, suggesting a time to review, revise, and reconsider ${planetA}-related matters.`;
  }

  // Handle sign ingress
  if (subtype === TransitSubtype.INGRESS && sign) {
    return `${planetA} enters the sign of ${sign}, bringing new qualities and themes to ${planetA}-related areas.`;
  }

  // Handle transit through a sign
  if (subtype === TransitSubtype.TRANSIT && sign) {
    return `${planetA} moving through ${sign}, infusing ${planetA}-related matters with ${sign} qualities.`;
  }

  // For regular aspects
  if (planetB && aspect) {
    return `${planetA} forms a ${aspect.toLowerCase()} aspect with ${planetB}, creating a specific energy pattern between these planetary influences.`;
  }

  return `Transit type for ${planetA}`;
}

/**
 * Create a transit type object
 */
export function createTransitType(
  planetA: Planet,
  planetB?: Planet,
  aspect?: Aspect,
  sign?: ZodiacSign,
  subtype: TransitSubtype = TransitSubtype.STANDARD
): TransitType {
  const id = generateTransitTypeId(planetA, planetB, aspect, sign, subtype);
  const name = generateTransitTypeName(planetA, planetB, aspect, sign, subtype);

  return {
    id,
    planetA,
    planetB,
    aspect,
    sign,
    subtype,
    name,
    description: generateTransitTypeDescription(
      planetA,
      planetB,
      aspect,
      sign,
      subtype
    ),
  };
}

/**
 * Get a transit type by its ID
 */
export function getTransitTypeById(id: string): TransitType | null {
  // Handle retrograde
  if (id.includes("_RETROGRADE")) {
    const planetA = id.split("_")[0] as Planet;
    return createTransitType(
      planetA,
      undefined,
      undefined,
      undefined,
      TransitSubtype.RETROGRADE
    );
  }

  // Handle station
  if (id.includes("_STATION")) {
    const planetA = id.split("_")[0] as Planet;
    return createTransitType(
      planetA,
      undefined,
      undefined,
      undefined,
      TransitSubtype.STATION
    );
  }

  // Handle sign ingress
  if (id.includes("_INGRESS_")) {
    const parts = id.split("_");
    const planetA = parts[0] as Planet;
    const sign = parts[2] as ZodiacSign;
    return createTransitType(
      planetA,
      undefined,
      undefined,
      sign,
      TransitSubtype.INGRESS
    );
  }

  // Handle transit through a sign
  if (id.includes("_IN_")) {
    const parts = id.split("_");
    const planetA = parts[0] as Planet;
    const sign = parts[2] as ZodiacSign;
    return createTransitType(
      planetA,
      undefined,
      undefined,
      sign,
      TransitSubtype.TRANSIT
    );
  }

  // Handle regular aspects
  const parts = id.split("_");
  if (parts.length === 3) {
    const planetA = parts[0] as Planet;
    const aspect = parts[1] as Aspect;
    const planetB = parts[2] as Planet;
    return createTransitType(planetA, planetB, aspect);
  }

  return null;
}
