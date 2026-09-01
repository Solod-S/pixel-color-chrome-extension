import { formatColor } from "../color/colorFormatter.js";

/**
 * Magnifier overlay rendering pixel grid and center target.
 */
export class Magnifier {
  constructor(shadowRoot) {
    this.shadowRoot = shadowRoot;
    this.visible = true;
    this.patchSize = 11; // 11x11 source pixels
    this.viewSize = 220; // 220x220 visual canvas

    this.container = document.createElement("div");
    this.container.className = "pixel-color-magnifier";
    this.container.style.cssText = `
      position: fixed;
      width: ${this.viewSize}px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1);
      overflow: hidden;
      z-index: 2147483647;
      pointer-events: none;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      box-sizing: border-box;
    `;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.viewSize;
    this.canvas.height = this.viewSize;
    this.canvas.style.cssText = `
      display: block;
      width: ${this.viewSize}px;
      height: ${this.viewSize}px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    `;
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    // Color readout badge
    this.infoBar = document.createElement("div");
    this.infoBar.style.cssText = `
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #334155;
      font-weight: 500;
    `;
    this.container.appendChild(this.infoBar);

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(this.container);
    }
  }

  setVisible(visible) {
    this.visible = visible;
    if (!visible) {
      this.container.style.display = "none";
    }
  }

  /**
   * Renders the patch onto the magnifier canvas.
   * @param {Object} patchData from ScreenshotSampler.getMagnifierPatch
   * @param {Object} currentColor ColorModel
   * @param {number} clientX
   * @param {number} clientY
   * @param {number} sampleSize
   */
  render(patchData, currentColor, clientX, clientY, sampleSize = 1) {
    if (!this.visible || !patchData || !this.ctx) {
      this.container.style.display = "none";
      return;
    }

    this.container.style.display = "block";

    // Position container near cursor (with flip on screen edges)
    const margin = 18;
    const totalHeight = this.viewSize + 32;
    let left = clientX + margin;
    let top = clientY + margin;

    if (left + this.viewSize > window.innerWidth - 10) {
      left = clientX - this.viewSize - margin;
    }
    if (top + totalHeight > window.innerHeight - 10) {
      top = clientY - totalHeight - margin;
    }

    // Clamp inside viewport
    left = Math.max(10, Math.min(window.innerWidth - this.viewSize - 10, left));
    top = Math.max(10, Math.min(window.innerHeight - totalHeight - 10, top));

    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;

    // Render magnified pixel grid
    const ctx = this.ctx;
    const {
      imageData,
      offsetX,
      offsetY,
      width: patchW,
      height: patchH,
    } = patchData;
    const cellSize = this.viewSize / this.patchSize;

    ctx.clearRect(0, 0, this.viewSize, this.viewSize);
    ctx.imageSmoothingEnabled = false;

    // Draw background pixels
    const data = imageData.data;
    for (let py = 0; py < patchH; py++) {
      for (let px = 0; px < patchW; px++) {
        // Source pixel in patch
        const idx = (py * patchW + px) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3] / 255;

        // Grid cell position in view
        // Center pixel is at center of view (index: Math.floor(patchSize/2))
        const gridX =
          (Math.floor(this.patchSize / 2) - offsetX + px) * cellSize;
        const gridY =
          (Math.floor(this.patchSize / 2) - offsetY + py) * cellSize;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(gridX, gridY, cellSize, cellSize);
      }
    }

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.patchSize; i++) {
      const pos = Math.round(i * cellSize);
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, this.viewSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(this.viewSize, pos);
      ctx.stroke();
    }

    // Draw sample region box if sampleSize > 1
    if (sampleSize > 1) {
      const halfSample = Math.floor(sampleSize / 2);
      const centerIdx = Math.floor(this.patchSize / 2);
      const minCell = centerIdx - halfSample;
      const boxSize = sampleSize * cellSize;
      const boxX = minCell * cellSize;
      const boxY = minCell * cellSize;

      ctx.strokeStyle = "#f59e0b"; // Amber border
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxSize, boxSize);
    }

    // Draw center target pixel reticle
    const centerIdx = Math.floor(this.patchSize / 2);
    const centerX = centerIdx * cellSize;
    const centerY = centerIdx * cellSize;

    // Dark outer border + white inner border for universal contrast
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 1, centerY - 1, cellSize + 2, cellSize + 2);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX, centerY, cellSize, cellSize);

    // Update bottom info bar
    const hex = currentColor?.hex || "#000000";
    const rgb = formatColor(currentColor, "rgb");
    this.infoBar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: ${hex}; border: 1px solid rgba(0,0,0,0.2);"></span>
        <span style="font-family: ui-monospace, SFMono-Regular, monospace; font-weight: 600;">${hex}</span>
      </div>
      <span style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; color: #64748b;">${rgb}</span>
    `;
  }

  cleanup() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.shadowRoot = null;
  }
}
