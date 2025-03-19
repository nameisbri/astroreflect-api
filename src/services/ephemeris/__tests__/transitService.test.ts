// src/services/ephemeris/__tests__/transitService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as sweph from "sweph"; // Import the real module
import {
  findTransitsInRange,
  getCurrentTransits,
  getSampleTransits,
  // Export these for direct testing
  checkAspect,
  generateTransitDescription,
} from "../transitService";
import { Planet, Aspect } from "../../../models/types";

// Mock date for consistent testing
const TEST_DATE = new Date("2025-01-15T12:00:00Z");

// Create a reliable mock for planetary positions
const mockPlanetaryPositions = {
  // Set up some predictable positions that will create aspects
  [Planet.SUN]: 0, // 0° Aries
  [Planet.MOON]: 60, // 0° Gemini - forms sextile with Sun
  [Planet.MERCURY]: 2, // 2° Aries - forms conjunction with Sun
  [Planet.VENUS]: 120, // 0° Leo - forms trine with Sun
  [Planet.MARS]: 90, // 0° Cancer - forms square with Sun
  [Planet.JUPITER]: 180, // 0° Libra - forms opposition with Sun
  [Planet.SATURN]: 30, // 0° Taurus - no major aspect with Sun
  [Planet.URANUS]: 150, // 0° Virgo - no major aspect with Sun
  [Planet.NEPTUNE]: 240, // 0° Sagittarius - forms trine with Moon
  [Planet.PLUTO]: 270, // 0° Capricorn - forms square with Moon
};

// Create the sweph mock
vi.mock("sweph", () => {
  return {
    default: {
      set_ephe_path: vi.fn(),
      julday: vi.fn((y, m, d, h) => 2460000.5 + (m * 30 + d)), // Simple mock for Julian day
      calc_ut: vi.fn((jd, planet, flag) => {
        // Map the planet number to the Planet enum
        const planetKey = Object.values(Planet)[planet];

        // Return the fixed position for this planet
        const longitude = mockPlanetaryPositions[planetKey] || 0;

        return {
          data: [
            longitude,
            0, // latitude
            1, // distance
            1, // speed
          ],
        };
      }),
    },
  };
});

describe("Transit Service", () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test the checkAspect function directly
  describe("checkAspect", () => {
    it("should detect conjunction when planets are within orb", () => {
      expect(checkAspect(0, 2, Aspect.CONJUNCTION)).toBe(true);
      expect(checkAspect(0, 9, Aspect.CONJUNCTION)).toBe(false); // Outside orb
    });

    it("should detect sextile when planets are within orb", () => {
      expect(checkAspect(0, 60, Aspect.SEXTILE)).toBe(true);
      expect(checkAspect(0, 65, Aspect.SEXTILE)).toBe(false); // Outside orb
    });

    it("should detect square when planets are within orb", () => {
      expect(checkAspect(0, 90, Aspect.SQUARE)).toBe(true);
      expect(checkAspect(0, 98, Aspect.SQUARE)).toBe(false); // Outside orb
    });

    it("should detect trine when planets are within orb", () => {
      expect(checkAspect(0, 120, Aspect.TRINE)).toBe(true);
      expect(checkAspect(0, 128, Aspect.TRINE)).toBe(false); // Outside orb
    });

    it("should detect opposition when planets are within orb", () => {
      expect(checkAspect(0, 180, Aspect.OPPOSITION)).toBe(true);
      expect(checkAspect(0, 189, Aspect.OPPOSITION)).toBe(false); // Outside orb
    });

    it("should handle angles that cross over 360°", () => {
      expect(checkAspect(355, 5, Aspect.CONJUNCTION)).toBe(true);
      expect(checkAspect(355, 175, Aspect.OPPOSITION)).toBe(true);
    });
  });

  // Test the transit description generation
  describe("generateTransitDescription", () => {
    it("should generate a description with both planet names", () => {
      const description = generateTransitDescription(
        Planet.SUN,
        Aspect.CONJUNCTION,
        Planet.MERCURY
      );
      expect(description).toContain(Planet.SUN);
      expect(description).toContain(Planet.MERCURY);
    });

    it("should generate different descriptions for different aspects", () => {
      const conjunctionDesc = generateTransitDescription(
        Planet.SUN,
        Aspect.CONJUNCTION,
        Planet.MOON
      );
      const squareDesc = generateTransitDescription(
        Planet.SUN,
        Aspect.SQUARE,
        Planet.MOON
      );
      const trineDesc = generateTransitDescription(
        Planet.SUN,
        Aspect.TRINE,
        Planet.MOON
      );

      expect(conjunctionDesc).not.toEqual(squareDesc);
      expect(conjunctionDesc).not.toEqual(trineDesc);
      expect(squareDesc).not.toEqual(trineDesc);
    });

    it("should include specific descriptions for certain planet combinations", () => {
      const sunMoon = generateTransitDescription(
        Planet.SUN,
        Aspect.CONJUNCTION,
        Planet.MOON
      );
      expect(sunMoon).toContain("conscious will");
      expect(sunMoon).toContain("emotional needs");
    });
  });

  // Test findTransitsInRange function
  describe("findTransitsInRange", () => {
    // Customized test to simulate changing aspects
    it("should find aspects between planets with our mocked positions", () => {
      const startDate = new Date(TEST_DATE);
      const endDate = new Date(TEST_DATE);
      endDate.setDate(endDate.getDate() + 7);

      // Override the calc_ut implementation to return different positions
      // at start date vs end date to simulate aspects forming or dissolving
      const originalCalcUt = sweph.default.calc_ut;

      // First call for each planet (at start date) - positions far apart
      let callCount = 0;
      sweph.default.calc_ut = vi.fn((jd, planet, flag) => {
        callCount++;
        // For each planet pair, first return positions that aren't in aspect
        if (callCount <= 10) {
          // First 10 calls - at start date
          return {
            data: [
              planet * 20, // Spread planets out so they aren't in aspect
              0, // latitude
              1, // distance
              1, // speed
            ],
          };
        } else {
          // Next calls - at end date
          // For end date, use our predefined positions that form aspects
          const planetKey = Object.values(Planet)[planet];
          const longitude = mockPlanetaryPositions[planetKey] || 0;

          return {
            data: [
              longitude,
              0, // latitude
              1, // distance
              1, // speed
            ],
          };
        }
      });

      // This should now find transits because positions change between start and end
      const transits = findTransitsInRange(startDate, endDate);

      // Restore the original mock
      sweph.default.calc_ut = originalCalcUt;

      console.log("Start positions for first few planets:");
      [0, 1, 2, 3].forEach((planetId) => {
        const planetKey = Object.values(Planet)[planetId];
        console.log(`${planetKey} at start: ${planetId * 20}°`);
      });

      console.log("End positions for first few planets:");
      [0, 1, 2, 3].forEach((planetId) => {
        const planetKey = Object.values(Planet)[planetId];
        console.log(
          `${planetKey} at end: ${mockPlanetaryPositions[planetKey]}°`
        );
      });

      // Let's also check what the function is actually testing internally
      console.log("Aspects at start:");
      // Check for some example aspects at start
      console.log(
        `Sun-Mercury conjunction at start: ${checkAspect(
          0 * 20,
          2 * 20,
          Aspect.CONJUNCTION
        )}`
      );
      console.log(
        `Sun-Venus trine at start: ${checkAspect(0 * 20, 3 * 20, Aspect.TRINE)}`
      );

      console.log("Aspects at end:");
      // Check for some example aspects at end
      console.log(
        `Sun-Mercury conjunction at end: ${checkAspect(
          mockPlanetaryPositions[Planet.SUN],
          mockPlanetaryPositions[Planet.MERCURY],
          Aspect.CONJUNCTION
        )}`
      );
      console.log(
        `Sun-Venus trine at end: ${checkAspect(
          mockPlanetaryPositions[Planet.SUN],
          mockPlanetaryPositions[Planet.VENUS],
          Aspect.TRINE
        )}`
      );

      console.log("Number of transits found:", transits.length);

      // We should find several transits now
      expect(transits.length).toBeGreaterThan(0);

      // If we have transits, check some specific ones
      if (transits.length > 0) {
        // Let's check that we have the aspects we'd expect with our mocked positions
        const hasConjunction = transits.some(
          (t) => t.aspect === Aspect.CONJUNCTION
        );
        const hasSquare = transits.some((t) => t.aspect === Aspect.SQUARE);
        const hasTrine = transits.some((t) => t.aspect === Aspect.TRINE);

        // At least one of these should be true based on our mock data
        expect(hasConjunction || hasSquare || hasTrine).toBe(true);
      }
    });

    it("should return an array of transits within the given range", () => {
      const startDate = new Date(TEST_DATE);
      const endDate = new Date(TEST_DATE);
      endDate.setDate(endDate.getDate() + 7); // One week ahead

      const transits = findTransitsInRange(startDate, endDate);

      // Basic validation
      expect(Array.isArray(transits)).toBe(true);

      // If there are transits, check their structure
      if (transits.length > 0) {
        const firstTransit = transits[0];
        expect(firstTransit).toHaveProperty("id");
        expect(firstTransit).toHaveProperty("planetA");
        expect(firstTransit).toHaveProperty("aspect");
        expect(firstTransit).toHaveProperty("planetB");
        expect(firstTransit).toHaveProperty("exactDate");
        expect(firstTransit).toHaveProperty("startDate");
        expect(firstTransit).toHaveProperty("endDate");
        expect(firstTransit).toHaveProperty("description");

        // Verify dates are valid and in order
        expect(firstTransit.startDate).toBeInstanceOf(Date);
        expect(firstTransit.exactDate).toBeInstanceOf(Date);
        expect(firstTransit.endDate).toBeInstanceOf(Date);
        expect(firstTransit.startDate.getTime()).toBeLessThanOrEqual(
          firstTransit.exactDate.getTime()
        );
        expect(firstTransit.exactDate.getTime()).toBeLessThanOrEqual(
          firstTransit.endDate.getTime()
        );
      }
    });

    it("should filter transits by planets when provided", () => {
      // Override the mock for this test to ensure we get some transits
      const originalCalcUt = sweph.default.calc_ut;
      let callCount = 0;
      sweph.default.calc_ut = vi.fn((jd, planet, flag) => {
        // Use the Julian day to determine which positions to return
        const isStartDate =
          Math.abs(
            jd -
              sweph.default.julday(
                startDate.getFullYear(),
                startDate.getMonth() + 1,
                startDate.getDate(),
                startDate.getHours() + startDate.getMinutes() / 60
              )
          ) < 0.1;

        if (isStartDate) {
          // Return non-aspect positions for start date
          return {
            data: [
              planet * 20, // Spread planets out so they aren't in aspect
              0, // latitude
              1, // distance
              1, // speed
            ],
          };
        } else {
          // Return aspect-forming positions for end date
          const planetKey = Object.values(Planet)[planet];
          const longitude = mockPlanetaryPositions[planetKey] || 0;

          return {
            data: [
              longitude,
              0, // latitude
              1, // distance
              1, // speed
            ],
          };
        }
      });
      const startDate = new Date(TEST_DATE);
      const endDate = new Date(TEST_DATE);
      endDate.setDate(endDate.getDate() + 14); // Two weeks ahead

      const filteredPlanets = [Planet.SUN, Planet.MOON, Planet.VENUS];
      const transits = findTransitsInRange(startDate, endDate, filteredPlanets);

      // Restore original mock
      sweph.default.calc_ut = originalCalcUt;

      // Check that all transits only involve the filtered planets
      transits.forEach((transit) => {
        expect(
          filteredPlanets.includes(transit.planetA) ||
            filteredPlanets.includes(transit.planetB)
        ).toBe(true);
      });
    });

    it("should handle an empty date range gracefully", () => {
      const startDate = new Date(TEST_DATE);
      const endDate = new Date(startDate); // Same date

      const transits = findTransitsInRange(startDate, endDate);

      // Should return an empty array, not error
      expect(Array.isArray(transits)).toBe(true);
    });

    it("should handle reversed date range gracefully", () => {
      const startDate = new Date(TEST_DATE);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() - 7); // End date is before start date

      // Should not throw an error
      expect(() => findTransitsInRange(startDate, endDate)).not.toThrow();

      // Should return an empty array
      const transits = findTransitsInRange(startDate, endDate);
      expect(Array.isArray(transits)).toBe(true);
      expect(transits.length).toBe(0);
    });
  });

  // Test the getCurrentTransits function
  describe("getCurrentTransits", () => {
    it("should return transits around the current date", () => {
      // Override the mock to ensure we get some transits
      const originalCalcUt = sweph.default.calc_ut;
      let callCount = 0;
      sweph.default.calc_ut = vi.fn((jd, planet, flag) => {
        callCount++;
        return {
          data: [
            callCount <= 10 ? planet * 20 : planet * 10, // Different positions start vs end
            0, // latitude
            1, // distance
            1, // speed
          ],
        };
      });

      const transits = getCurrentTransits(TEST_DATE, 3);

      // Restore original mock
      sweph.default.calc_ut = originalCalcUt;

      expect(Array.isArray(transits)).toBe(true);

      // Check date ranges if transits exist
      if (transits.length > 0) {
        // Create date range for comparison
        const earliestDate = new Date(TEST_DATE);
        earliestDate.setDate(earliestDate.getDate() - 3);
        earliestDate.setHours(0, 0, 0, 0);

        const latestDate = new Date(TEST_DATE);
        latestDate.setDate(latestDate.getDate() + 3);
        latestDate.setHours(23, 59, 59, 999);

        // Check at least one transit has exact date within range
        const hasTransitInRange = transits.some(
          (transit) =>
            transit.exactDate >= earliestDate && transit.exactDate <= latestDate
        );

        expect(hasTransitInRange).toBe(true);
      }
    });

    it("should handle zero dayRange appropriately", () => {
      // Test with day range 0 - should only find transits occurring exactly on TEST_DATE
      const transits = getCurrentTransits(TEST_DATE, 0);

      expect(Array.isArray(transits)).toBe(true);
    });
  });

  // Test the getSampleTransits function
  describe("getSampleTransits", () => {
    it("should always return at least one transit", () => {
      const transits = getSampleTransits(TEST_DATE);

      expect(Array.isArray(transits)).toBe(true);
      expect(transits.length).toBeGreaterThan(0);
    });

    it("should work with different dates", () => {
      const differentDate = new Date("2026-05-15");
      const transits = getSampleTransits(differentDate);

      expect(Array.isArray(transits)).toBe(true);
      expect(transits.length).toBeGreaterThan(0);
    });
  });

  // Test error handling
  describe("Error handling", () => {
    it("should handle Swiss Ephemeris errors gracefully", () => {
      // Temporarily override the mock to simulate an error
      const originalCalcUt = sweph.default.calc_ut;
      sweph.default.calc_ut = vi.fn().mockImplementation(() => {
        throw new Error("Swiss Ephemeris calculation error");
      });

      // Should not throw but return fallback sample transits
      const transits = getSampleTransits();
      expect(Array.isArray(transits)).toBe(true);
      expect(transits.length).toBeGreaterThan(0);

      // Restore the original mock
      sweph.default.calc_ut = originalCalcUt;
    });
  });
});
