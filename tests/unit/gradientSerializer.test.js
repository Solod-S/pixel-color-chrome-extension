import { describe, it, expect } from "vitest";
import { serializeGradientCss } from "../../src/gradient/gradientSerializer.js";

describe("gradientSerializer", () => {
  it("serializes simple 2-stop linear gradient", () => {
    const model = {
      type: "linear",
      angle: 90,
      stops: [
        { id: "1", color: "#FF0000", opacity: 1, position: 0 },
        { id: "2", color: "#0000FF", opacity: 1, position: 100 },
      ],
    };
    expect(serializeGradientCss(model)).toBe(
      "background: linear-gradient(90deg, #FF0000 0%, #0000FF 100%);",
    );
  });

  it("serializes 3-stop linear gradient with opacity", () => {
    const model = {
      type: "linear",
      angle: 180,
      stops: [
        { id: "1", color: "#1E5799", opacity: 1, position: 0 },
        { id: "2", color: "#2989D8", opacity: 0.5, position: 50 },
        { id: "3", color: "#7DB9E8", opacity: 1, position: 100 },
      ],
    };
    expect(serializeGradientCss(model)).toBe(
      "background: linear-gradient(180deg, #1E5799 0%, rgba(41, 137, 216, 0.5) 50%, #7DB9E8 100%);",
    );
  });

  it("serializes radial gradient", () => {
    const model = {
      type: "radial",
      radialShape: "circle",
      radialPosition: "center",
      stops: [
        { id: "1", color: "#FFFFFF", opacity: 1, position: 0 },
        { id: "2", color: "#000000", opacity: 1, position: 100 },
      ],
    };
    expect(serializeGradientCss(model)).toBe(
      "background: radial-gradient(circle at center, #FFFFFF 0%, #000000 100%);",
    );
  });

  it("handles disordered stop positions by sorting them", () => {
    const model = {
      type: "linear",
      angle: 45,
      stops: [
        { id: "2", color: "#0000FF", opacity: 1, position: 100 },
        { id: "1", color: "#FF0000", opacity: 1, position: 0 },
      ],
    };
    expect(serializeGradientCss(model)).toBe(
      "background: linear-gradient(45deg, #FF0000 0%, #0000FF 100%);",
    );
  });
});
