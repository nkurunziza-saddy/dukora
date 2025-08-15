import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getMonthData,
  getCurrentMonthBoundary,
  getAvailableMonthsForAnalytics,
  parseMonth,
  parseMonthYearShort,
  getPreviousMonth,
} from "@/server/helpers/time-date-forrmatters";
import { startOfMonth, subMonths, format } from "date-fns";

describe("Time Date Formatters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-08-14T01:41:01+02:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getMonthData", () => {
    it("should return correct month data for 0 months ago (should be 1 month ago due to adjustment)", () => {
      const result = getMonthData(0);

      expect(result.monthName).toBe("July");
      expect(result.year).toBe("2024");
      expect(result.date.getMonth()).toBe(6);
    });

    it("should return correct month data for 1 month ago (should be 3 months ago due to adjustment)", () => {
      const result = getMonthData(1);

      expect(result.monthName).toBe("June");
      expect(result.year).toBe("2024");
      expect(result.date.getMonth()).toBe(5);
    });

    it("should always exclude current month by adding 1 to monthsAgo", () => {
      const result = getMonthData(0);
      const currentMonth = startOfMonth(new Date());

      expect(result.date.getTime()).toBeLessThan(currentMonth.getTime());
    });

    it("should handle large monthsAgo values", () => {
      const result = getMonthData(12);

      expect(result.year).toBe("2023");
      expect(result.monthName).toBe("July");
    });

    it("should ensure minimum of 1 month adjustment", () => {
      const result = getMonthData(-5);

      const currentMonth = startOfMonth(new Date());
      expect(result.date.getTime()).toBeLessThan(currentMonth.getTime());
    });
  });

  describe("getCurrentMonthBoundary", () => {
    it("should return last month as boundary", () => {
      const result = getCurrentMonthBoundary();
      const expectedBoundary = subMonths(startOfMonth(new Date()), 1);

      expect(result.getTime()).toBe(expectedBoundary.getTime());
    });

    it("should always be before current month", () => {
      const result = getCurrentMonthBoundary();
      const currentMonth = startOfMonth(new Date());

      expect(result.getTime()).toBeLessThan(currentMonth.getTime());
    });
  });

  describe("getAvailableMonthsForAnalytics", () => {
    it("should return available months from business creation to current boundary", () => {
      const businessCreatedAt = new Date("2024-01-15");
      const result = getAvailableMonthsForAnalytics(businessCreatedAt);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].label).toContain("July 2024");
      expect(result[result.length - 1].label).toContain("January 2024");
    });

    it("should limit to maximum 24 months", () => {
      const businessCreatedAt = new Date("2020-01-01");
      const result = getAvailableMonthsForAnalytics(businessCreatedAt);

      expect(result.length).toBeLessThanOrEqual(24);
    });

    it("should handle recent business creation", () => {
      const businessCreatedAt = new Date("2024-07-01");
      const result = getAvailableMonthsForAnalytics(businessCreatedAt);

      expect(result.length).toBe(1);
      expect(result[0].label).toContain("July 2024");
    });

    it("should return empty array for business created this month", () => {
      const businessCreatedAt = new Date("2024-08-01");
      const result = getAvailableMonthsForAnalytics(businessCreatedAt);

      expect(result.length).toBe(0);
    });

    it("should return correct value/label pairs", () => {
      const businessCreatedAt = new Date("2024-05-01");
      const result = getAvailableMonthsForAnalytics(businessCreatedAt);

      expect(result[0]).toMatchObject({
        value: 0,
        label: expect.stringContaining("July 2024"),
        date: expect.any(Date),
      });

      if (result.length > 1) {
        expect(result[1]).toMatchObject({
          value: 1,
          label: expect.stringContaining("June 2024"),
          date: expect.any(Date),
        });
      }
    });
  });

  describe("parseMonth", () => {
    it("should parse month number correctly", () => {
      const result = parseMonth(6);

      expect(result.getMonth()).toBe(5);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getDate()).toBe(1);
    });

    it("should handle edge cases", () => {
      const result1 = parseMonth(1);
      expect(result1.getMonth()).toBe(0);

      const result2 = parseMonth(12);
      expect(result2.getMonth()).toBe(11);
    });
  });

  describe("parseMonthYearShort", () => {
    it("should parse month/year string correctly", () => {
      const result = parseMonthYearShort("6/24");

      expect(result.getMonth()).toBe(5);
      expect(result.getFullYear()).toBe(2024);
    });

    it("should throw error for invalid format", () => {
      expect(() => parseMonthYearShort("invalid")).toThrow(
        "Invalid argument invalid"
      );
    });

    it("should handle different valid formats", () => {
      const result1 = parseMonthYearShort("1/24");
      expect(result1.getMonth()).toBe(0);

      const result2 = parseMonthYearShort("12/23");
      expect(result2.getFullYear()).toBe(2023);
    });
  });

  describe("getPreviousMonth", () => {
    it("should return previous month in YYYY-MM format", () => {
      const result = getPreviousMonth("2024-08");
      expect(result).toBe("2024-07");
    });

    it("should handle year boundary", () => {
      const result = getPreviousMonth("2024-01");
      expect(result).toBe("2023-12");
    });

    it("should handle different month formats", () => {
      const result = getPreviousMonth("2024-12");
      expect(result).toBe("2024-11");
    });
  });

  describe("Integration tests", () => {
    it("should ensure getMonthData never returns current month", () => {
      const currentMonth = startOfMonth(new Date());

      for (let i = 0; i < 10; i++) {
        const result = getMonthData(i);
        expect(result.date.getTime()).toBeLessThan(currentMonth.getTime());
      }
    });

    it("should ensure getCurrentMonthBoundary aligns with getMonthData logic", () => {
      const boundary = getCurrentMonthBoundary();
      const monthData = getMonthData(0);

      expect(monthData.date.getTime()).toBe(boundary.getTime());
    });

    it("should ensure available months respect the boundary", () => {
      const businessCreatedAt = new Date("2024-01-01");
      const availableMonths = getAvailableMonthsForAnalytics(businessCreatedAt);
      const boundary = getCurrentMonthBoundary();

      availableMonths.forEach((month) => {
        expect(month.date.getTime()).toBeLessThanOrEqual(boundary.getTime());
      });
    });
  });
});
