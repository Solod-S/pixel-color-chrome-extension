import { describe, it, expect } from "vitest";
import { averagePixels, createColorModel } from "../../src/color/colorMath.js";

describe("Sampling & Averaging", () => {
  it("calculates average of uniform region", () => {
    const pixels = Array(9).fill({ r: 200, g: 100, b: 50, a: 1 });
    const avg = averagePixels(pixels);
    expect(avg).toEqual({ r: 200, g: 100, b: 50, a: 1 });
  });

  it("calculates average of high contrast 5x5 region", () => {
    const pixels = [
      ...Array(12).fill({ r: 0, g: 0, b: 0, a: 1 }),
      ...Array(13).fill({ r: 255, g: 255, b: 255, a: 1 }),
    ];
    const avg = averagePixels(pixels);
    expect(avg.r).toBe(Math.round((13 * 255) / 25)); // 133
    expect(avg.g).toBe(Math.round((13 * 255) / 25));
    expect(avg.b).toBe(Math.round((13 * 255) / 25));
  });

  it("formats color model correctly from averaged pixels", () => {
    const pixels = [
      { r: 255, g: 0, b: 0, a: 1 },
      { r: 0, g: 0, b: 255, a: 1 },
    ];
    const avg = averagePixels(pixels);
    const model = createColorModel(avg);
    expect(model.r).toBe(128);
    expect(model.g).toBe(0);
    expect(model.b).toBe(128);
    expect(model.hex).toBe("#800080");
  });
});
