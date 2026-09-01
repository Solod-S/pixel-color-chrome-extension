/**
 * Maps viewport client coordinates (CSS pixels) to screenshot pixel coordinates.
 * Accurately handles HiDPI (devicePixelRatio), browser zoom, and edge boundaries.
 */

export class CoordinateMapper {
  constructor(screenshotWidth, screenshotHeight, clientWidth, clientHeight) {
    this.updateDimensions(
      screenshotWidth,
      screenshotHeight,
      clientWidth,
      clientHeight,
    );
  }

  updateDimensions(
    screenshotWidth,
    screenshotHeight,
    clientWidth,
    clientHeight,
  ) {
    this.screenshotWidth = Math.max(1, screenshotWidth || 1);
    this.screenshotHeight = Math.max(1, screenshotHeight || 1);
    this.clientWidth = Math.max(1, clientWidth || 1);
    this.clientHeight = Math.max(1, clientHeight || 1);

    this.scaleX = this.screenshotWidth / this.clientWidth;
    this.scaleY = this.screenshotHeight / this.clientHeight;
  }

  /**
   * Maps client (x, y) coordinates to image pixel (x, y).
   */
  clientToPixel(clientX, clientY) {
    const px = Math.floor(clientX * this.scaleX);
    const py = Math.floor(clientY * this.scaleY);

    return {
      x: Math.max(0, Math.min(this.screenshotWidth - 1, px)),
      y: Math.max(0, Math.min(this.screenshotHeight - 1, py)),
    };
  }

  /**
   * Gets pixel bounds for sampling area of size (e.g. 1, 3, 5, 11, 25) around center pixel.
   */
  getSampleBounds(pixelX, pixelY, sampleSize = 1) {
    const half = Math.floor(sampleSize / 2);

    const minX = Math.max(0, pixelX - half);
    const maxX = Math.min(this.screenshotWidth - 1, pixelX + half);
    const minY = Math.max(0, pixelY - half);
    const maxY = Math.min(this.screenshotHeight - 1, pixelY + half);

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }
}
