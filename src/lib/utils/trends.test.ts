import { describe, expect, it } from "vitest";
import { buildTrendPolyline } from "./trends";

describe("buildTrendPolyline", () => {
  it("maps scores into a bounded SVG polyline", () => {
    const result = buildTrendPolyline([50, 75, 100], {
      width: 120,
      height: 40,
      padding: 4,
    });

    expect(result.points).toBe("4,20 60,12 116,4");
    expect(result.direction).toBe("up");
  });

  it("handles single-point trends without division by zero", () => {
    const result = buildTrendPolyline([80], {
      width: 120,
      height: 40,
      padding: 4,
    });

    expect(result.points).toBe("60,10");
    expect(result.direction).toBe("flat");
  });
});
