export enum Planet {
  SUN = "Sun",
  MOON = "Moon",
  MERCURY = "Mercury",
  VENUS = "Venus",
  MARS = "Mars",
  JUPITER = "Jupiter",
  SATURN = "Saturn",
  URANUS = "Uranus",
  NEPTUNE = "Neptune",
  PLUTO = "Pluto",
}

export enum Aspect {
  CONJUNCTION = "Conjunction",
  SEXTILE = "Sextile",
  SQUARE = "Square",
  TRINE = "Trine",
  OPPOSITION = "Opposition",
}

export interface Transit {
  id: string;
  planetA: Planet;
  aspect: Aspect;
  planetB: Planet;
  exactDate: Date;
  startDate: Date;
  endDate: Date;
  description?: string;
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
  content: string;
  mood?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
