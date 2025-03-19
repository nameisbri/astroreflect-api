export enum Planet {
  SUN = "SUN",
  MOON = "MOON",
  MERCURY = "MERCURY",
  VENUS = "VENUS",
  MARS = "MARS",
  JUPITER = "JUPITER",
  SATURN = "SATURN",
  URANUS = "URANUS",
  NEPTUNE = "NEPTUNE",
  PLUTO = "PLUTO",
}

export enum Aspect {
  CONJUNCTION = "Conjunction",
  SEXTILE = "Sextile",
  SQUARE = "Square",
  TRINE = "Trine",
  OPPOSITION = "Opposition",
}

export enum TransitSubtype {
  STANDARD = "Standard",
  RETROGRADE = "Retrograde",
  DIRECT = "Direct",
  STATION = "Station",
  INGRESS = "Ingress",
  TRANSIT = "Transit",
}

export enum ZodiacSign {
  ARIES = "Aries",
  TAURUS = "Taurus",
  GEMINI = "Gemini",
  CANCER = "Cancer",
  LEO = "Leo",
  VIRGO = "Virgo",
  LIBRA = "Libra",
  SCORPIO = "Scorpio",
  SAGITTARIUS = "Sagittarius",
  CAPRICORN = "Capricorn",
  AQUARIUS = "Aquarius",
  PISCES = "Pisces",
}

export enum TransitTiming {
  ACTIVE = "Active", // Currently in effect
  APPLYING = "Applying", // Building toward exactitude
  SEPARATING = "Separating", // Moving away from exactitude
  UPCOMING = "Upcoming", // Not yet active but approaching
}

export interface Transit {
  id: string;
  transitTypeId: string;
  planetA: Planet;
  planetB?: Planet;
  aspect?: Aspect;
  sign?: ZodiacSign;
  subtype: TransitSubtype;
  exactDate: Date;
  startDate: Date;
  endDate: Date;
  description: string;
  timing?: TransitTiming;
  intensity?: number; // 0-100% measure of how strong the aspect is within its orb
}

export interface TransitType {
  id: string;
  planetA: Planet;
  planetB?: Planet;
  aspect?: Aspect;
  sign?: ZodiacSign;
  subtype: TransitSubtype;
  name: string;
  description: string;
}

export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
}

export interface JournalEntry {
  id: string;
  transitId: string;
  transitTypeId?: string; // Added for cross-reference to transit types
  content: string;
  mood?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
