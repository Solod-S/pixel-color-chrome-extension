import { describe, it, expect } from "vitest";
import {
  parseCssColor,
  getStandardColorName,
} from "../../src/color/colorParser.js";

describe("colorParser", () => {
  it("parses short and standard hex", () => {
    const c1 = parseCssColor("#fff");
    expect(c1.hex).toBe("#FFFFFF");

    const c2 = parseCssColor("#ff0000");
    expect(c2.hex).toBe("#FF0000");
  });

  it("parses rgb and rgba string representations", () => {
    const c1 = parseCssColor("rgb(255, 0, 0)");
    expect(c1.hex).toBe("#FF0000");

    const c2 = parseCssColor("rgba(0, 255, 0, 0.5)");
    expect(c2.r).toBe(0);
    expect(c2.g).toBe(255);
    expect(c2.a).toBe(0.5);

    const c3 = parseCssColor("rgb(100% 50% 0%)");
    expect(c3.r).toBe(255);
    expect(c3.g).toBe(128);
    expect(c3.b).toBe(0);
  });

  it("parses hsl and hsla", () => {
    const c1 = parseCssColor("hsl(0, 100%, 50%)");
    expect(c1.hex).toBe("#FF0000");

    const c2 = parseCssColor("hsla(120, 100%, 50%, 0.7)");
    expect(c2.hex).toBe("#00FF00");
    expect(c2.a).toBe(0.7);
  });

  it("parses named colors", () => {
    const c1 = parseCssColor("red");
    expect(c1.hex).toBe("#FF0000");

    const c2 = parseCssColor("tomato");
    expect(c2.hex).toBe("#FF6347");
  });

  it("handles transparent correctly", () => {
    const c1 = parseCssColor("transparent");
    expect(c1.isTransparent).toBe(true);
    expect(c1.a).toBe(0);

    const c2 = parseCssColor("rgba(0, 0, 0, 0)");
    expect(c2.isTransparent).toBe(true);
  });

  it("returns null for invalid strings", () => {
    expect(parseCssColor("not-a-color")).toBeNull();
    expect(parseCssColor("")).toBeNull();
    expect(parseCssColor(null)).toBeNull();
  });

  it("gets standard CSS color names", () => {
    expect(getStandardColorName("#ff0000")).toBe("red");
    expect(getStandardColorName("#000000")).toBe("black");
    expect(getStandardColorName("#123456")).toBeNull();
  });
});
