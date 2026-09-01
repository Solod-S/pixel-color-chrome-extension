import { describe, it, expect } from "vitest";
import { CoordinateMapper } from "../../src/picker/coordinateMapper.js";

describe("CoordinateMapper", () => {
  it("maps 1:1 coordinates when screenshot size equals client size", () => {
    const mapper = new CoordinateMapper(1000, 800, 1000, 800);
    expect(mapper.clientToPixel(100, 200)).toEqual({ x: 100, y: 200 });
  });

  it("maps 2x HiDPI (e.g. Retina DPR 2)", () => {
    const mapper = new CoordinateMapper(2000, 1600, 1000, 800);
    expect(mapper.clientToPixel(100, 200)).toEqual({ x: 200, y: 400 });
    expect(mapper.clientToPixel(500, 400)).toEqual({ x: 1000, y: 800 });
  });

  it("handles non-integer zoom scale", () => {
    const mapper = new CoordinateMapper(1500, 1200, 1000, 800); // 1.5x zoom
    expect(mapper.clientToPixel(100, 100)).toEqual({ x: 150, y: 150 });
  });

  it("clamps coordinates to image boundaries at viewport edges", () => {
    const mapper = new CoordinateMapper(1000, 800, 1000, 800);
    expect(mapper.clientToPixel(-50, -50)).toEqual({ x: 0, y: 0 });
    expect(mapper.clientToPixel(1200, 900)).toEqual({ x: 999, y: 799 });
  });

  it("calculates sample bounds for 1x1, 3x3, 5x5, 11x11, 25x25", () => {
    const mapper = new CoordinateMapper(1000, 1000, 1000, 1000);

    const b1 = mapper.getSampleBounds(500, 500, 1);
    expect(b1).toEqual({
      minX: 500,
      maxX: 500,
      minY: 500,
      maxY: 500,
      width: 1,
      height: 1,
    });

    const b3 = mapper.getSampleBounds(500, 500, 3);
    expect(b3).toEqual({
      minX: 499,
      maxX: 501,
      minY: 499,
      maxY: 501,
      width: 3,
      height: 3,
    });

    const b5 = mapper.getSampleBounds(500, 500, 5);
    expect(b5).toEqual({
      minX: 498,
      maxX: 502,
      minY: 498,
      maxY: 502,
      width: 5,
      height: 5,
    });

    const b11 = mapper.getSampleBounds(500, 500, 11);
    expect(b11).toEqual({
      minX: 495,
      maxX: 505,
      minY: 495,
      maxY: 505,
      width: 11,
      height: 11,
    });

    const b25 = mapper.getSampleBounds(500, 500, 25);
    expect(b25).toEqual({
      minX: 488,
      maxX: 512,
      minY: 488,
      maxY: 512,
      width: 25,
      height: 25,
    });
  });

  it("clamps sample bounds at image corners", () => {
    const mapper = new CoordinateMapper(100, 100, 100, 100);
    const cornerBounds = mapper.getSampleBounds(0, 0, 5);
    expect(cornerBounds).toEqual({
      minX: 0,
      maxX: 2,
      minY: 0,
      maxY: 2,
      width: 3,
      height: 3,
    });
  });
});
