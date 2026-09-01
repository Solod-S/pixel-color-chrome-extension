import { describe, it, expect } from "vitest";
import {
  rgbToHex,
  rgbaToHex8,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  hsvToHsl,
  hslToHsv,
  averagePixels,
  relativeLuminance,
  contrastRatio,
  createColorModel,
} from "../../src/color/colorMath.js";

describe("colorMath", () => {
  describe("rgbToHex and rgbaToHex8", () => {
    it("converts RGB to uppercase HEX by default", () => {
      expect(rgbToHex(255, 0, 128)).toBe("#FF0080");
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
      expect(rgbToHex(255, 255, 255)).toBe("#FFFFFF");
    });

    it("converts RGB to lowercase HEX when upper is false", () => {
      expect(rgbToHex(255, 0, 128, false)).toBe("#ff0080");
    });

    it("clamps values out of 0-255 range", () => {
      expect(rgbToHex(300, -20, 100)).toBe("#FF0064");
    });

    it("converts RGBA to HEX8", () => {
      expect(rgbaToHex8(255, 255, 255, 1)).toBe("#FFFFFFFF");
      expect(rgbaToHex8(255, 0, 0, 0.5)).toBe("#FF000080");
      expect(rgbaToHex8(0, 0, 0, 0)).toBe("#00000000");
    });
  });

  describe("hexToRgb", () => {
    it("converts 6-digit hex", () => {
      expect(hexToRgb("#FF0080")).toEqual({ r: 255, g: 0, b: 128, a: 1 });
      expect(hexToRgb("00ff00")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    });

    it("converts 3-digit hex", () => {
      expect(hexToRgb("#F08")).toEqual({ r: 255, g: 0, b: 136, a: 1 });
      expect(hexToRgb("fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it("converts 8-digit hex", () => {
      expect(hexToRgb("#FF000080")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it("returns null for invalid hex", () => {
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("#12345")).toBeNull();
      expect(hexToRgb("")).toBeNull();
    });
  });

  describe("RGB <-> HSL conversions", () => {
    it("converts RGB to HSL correctly", () => {
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
      expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
    });

    it("converts HSL to RGB correctly", () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
      expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 });
    });
  });

  describe("RGB <-> HSV conversions", () => {
    it("converts RGB to HSV correctly", () => {
      expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });
      expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 });
      expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 });
    });

    it("converts HSV to RGB correctly", () => {
      expect(hsvToRgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hsvToRgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hsvToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe("averagePixels", () => {
    it("calculates average RGB from multiple pixels", () => {
      const pixels = [
        { r: 255, g: 0, b: 0, a: 1 },
        { r: 0, g: 255, b: 0, a: 1 },
        { r: 0, g: 0, b: 255, a: 1 },
      ];
      expect(averagePixels(pixels)).toEqual({ r: 85, g: 85, b: 85, a: 1 });
    });

    it("handles single pixel", () => {
      const pixels = [{ r: 100, g: 150, b: 200, a: 0.8 }];
      expect(averagePixels(pixels)).toEqual({ r: 100, g: 150, b: 200, a: 0.8 });
    });

    it("handles empty pixel list safely", () => {
      expect(averagePixels([])).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });
  });

  describe("relativeLuminance & contrastRatio", () => {
    it("calculates contrast between black and white as 21:1", () => {
      const black = { r: 0, g: 0, b: 0 };
      const white = { r: 255, g: 255, b: 255 };
      expect(contrastRatio(black, white)).toBe(21);
    });

    it("calculates contrast between identical colors as 1:1", () => {
      const red = { r: 255, g: 0, b: 0 };
      expect(contrastRatio(red, red)).toBe(1);
    });
  });

  describe("createColorModel", () => {
    it("creates complete synced model", () => {
      const model = createColorModel({ r: 231, g: 72, b: 63, a: 1 });
      expect(model.hex).toBe("#E7483F");
      expect(model.r).toBe(231);
      expect(model.g).toBe(72);
      expect(model.b).toBe(63);
      expect(model.hsl.h).toBe(3);
      expect(model.hsv.v).toBe(91);
    });
  });
});
