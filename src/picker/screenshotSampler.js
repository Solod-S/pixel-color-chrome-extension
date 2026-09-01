import { CoordinateMapper } from "./coordinateMapper.js";
import { averagePixels, createColorModel } from "../color/colorMath.js";

/**
 * Handles screenshot memory, offscreen canvas rendering, and pixel sampling.
 */
export class ScreenshotSampler {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.image = null;
    this.mapper = null;
    this.width = 0;
    this.height = 0;
  }

  /**
   * Initializes sampler with a screenshot data URL and client dimensions.
   */
  async load(dataUrl, clientWidth, clientHeight) {
    this.cleanup();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          this.image = img;
          this.width = img.naturalWidth || img.width;
          this.height = img.naturalHeight || img.height;

          this.canvas = document.createElement("canvas");
          this.canvas.width = this.width;
          this.canvas.height = this.height;

          this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
          if (!this.ctx) {
            throw new Error("Failed to create canvas 2d context");
          }

          this.ctx.drawImage(img, 0, 0);

          this.mapper = new CoordinateMapper(
            this.width,
            this.height,
            clientWidth || window.innerWidth,
            clientHeight || window.innerHeight,
          );

          resolve(this);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (err) => {
        reject(new Error("Failed to load screenshot image: " + err));
      };

      img.src = dataUrl;
    });
  }

  /**
   * Updates coordinate mapping on viewport resize.
   */
  updateDimensions(clientWidth, clientHeight) {
    if (this.mapper) {
      this.mapper.updateDimensions(
        this.width,
        this.height,
        clientWidth,
        clientHeight,
      );
    }
  }

  /**
   * Samples color at client viewport (x, y) coordinates.
   * @param {number} clientX
   * @param {number} clientY
   * @param {number} sampleSize (1, 3, 5, 11, 25)
   * @param {'average'|'center'} sampleMode
   */
  sampleColor(clientX, clientY, sampleSize = 1, sampleMode = "average") {
    if (!this.ctx || !this.mapper) {
      return createColorModel({ r: 0, g: 0, b: 0, a: 1 });
    }

    const { x: px, y: py } = this.mapper.clientToPixel(clientX, clientY);

    if (sampleSize <= 1 || sampleMode === "center") {
      const imgData = this.ctx.getImageData(px, py, 1, 1);
      const [r, g, b, a] = imgData.data;
      return createColorModel({ r, g, b, a: a / 255 });
    }

    const bounds = this.mapper.getSampleBounds(px, py, sampleSize);
    const imgData = this.ctx.getImageData(
      bounds.minX,
      bounds.minY,
      bounds.width,
      bounds.height,
    );
    const data = imgData.data;
    const pixels = [];

    for (let i = 0; i < data.length; i += 4) {
      pixels.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3] / 255,
      });
    }

    const avg = averagePixels(pixels);
    return createColorModel(avg);
  }

  /**
   * Retrieves an ImageData patch of size NxN centered on client (x, y) for magnifier rendering.
   */
  getMagnifierPatch(clientX, clientY, patchSize = 11) {
    if (!this.ctx || !this.mapper) {
      return null;
    }

    const { x: px, y: py } = this.mapper.clientToPixel(clientX, clientY);
    const half = Math.floor(patchSize / 2);

    const minX = Math.max(0, px - half);
    const minY = Math.max(0, py - half);
    const maxX = Math.min(this.width - 1, px + half);
    const maxY = Math.min(this.height - 1, py + half);

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    const imgData = this.ctx.getImageData(minX, minY, w, h);

    return {
      imageData: imgData,
      pixelX: px,
      pixelY: py,
      minX,
      minY,
      width: w,
      height: h,
      offsetX: px - minX,
      offsetY: py - minY,
    };
  }

  /**
   * Cleans up canvas and image references from memory.
   */
  cleanup() {
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
    this.ctx = null;
    if (this.image) {
      this.image.src = "";
      this.image = null;
    }
    this.mapper = null;
  }
}
