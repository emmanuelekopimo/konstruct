import { describe, expect, it } from "vitest";
import { addDays, daysBetween, formatDay, getToday, relativeDay } from "@/lib/dates";
import { formatQty, naira, nairaShort } from "@/lib/money";

describe("dates", () => {
  it("uses KONSTRUCT_TODAY when it is a valid date", () => {
    expect(getToday({ KONSTRUCT_TODAY: "2026-10-04" })).toBe("2026-10-04");
  });
  it("ignores a malformed KONSTRUCT_TODAY", () => {
    expect(getToday({ KONSTRUCT_TODAY: "04/10/2026" })).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getToday({ KONSTRUCT_TODAY: "04/10/2026" })).not.toBe("04/10/2026");
  });
  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-04", 14)).toBe("2026-10-18");
    expect(addDays("2026-12-25", 10)).toBe("2027-01-04");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("counts days between dates", () => {
    expect(daysBetween("2026-08-19", "2026-10-04")).toBe(46);
    expect(daysBetween("2026-10-04", "2026-10-04")).toBe(0);
  });
  it("formats days for people", () => {
    expect(formatDay("2026-10-04")).toBe("4 Oct 2026");
    expect(relativeDay("2026-10-04", "2026-10-04")).toBe("today");
    expect(relativeDay("2026-10-03", "2026-10-04")).toBe("yesterday");
    expect(relativeDay("2026-09-25", "2026-10-04")).toBe("9 days ago");
    expect(relativeDay("2026-06-01", "2026-10-04")).toBe("1 Jun 2026");
  });
});

describe("money", () => {
  it("formats whole Naira with separators", () => {
    expect(naira(16597400)).toBe("₦16,597,400");
    expect(naira(999.6)).toBe("₦1,000");
    expect(naira(-2500)).toBe("-₦2,500");
    expect(naira(10500, "")).toBe("10,500");
  });
  it("shortens large amounts", () => {
    expect(nairaShort(66_659_560)).toBe("₦66.7M");
    expect(nairaShort(32_000_000)).toBe("₦32M");
    expect(nairaShort(1_250_000_000)).toBe("₦1.3B");
    expect(nairaShort(45_000)).toBe("₦45k");
  });
  it("formats quantities", () => {
    expect(formatQty(1450)).toBe("1,450");
    expect(formatQty(38.5)).toBe("38.5");
  });
});
