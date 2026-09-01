import { ScreenshotSampler } from "./screenshotSampler.js";
import { Magnifier } from "./magnifier.js";
import { ElementInspector } from "./elementInspector.js";
import { formatColor } from "../color/colorFormatter.js";
import { copyToClipboard } from "../shared/clipboard.js";
import { MESSAGE_TYPES } from "../shared/messages.js";

export class PickerOverlay {
  constructor(initialDataUrl, settings) {
    this.settings = settings || {};
    this.sampler = new ScreenshotSampler();
    this.currentDataUrl = initialDataUrl;
    this.active = false;
    this.isRecapturing = false;

    this.clientX = Math.round(window.innerWidth / 2);
    this.clientY = Math.round(window.innerHeight / 2);
    this.currentColor = null;
    this.currentElementInfo = null;

    this.sampleSize = this.settings.sampleSize || 1;
    this.sampleMode = this.settings.sampleMode || "average";

    this.rafId = null;
    this.scrollTimeout = null;

    // DOM & Shadow Root
    this.rootContainer = null;
    this.shadowRoot = null;
    this.toolbar = null;
    this.toast = null;
    this.magnifier = null;
    this.inspector = null;

    // Bound event handlers
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  async start() {
    this.setupShadowDOM();

    // Load initial screenshot
    await this.sampler.load(
      this.currentDataUrl,
      window.innerWidth,
      window.innerHeight,
    );

    this.magnifier = new Magnifier(this.shadowRoot);
    this.magnifier.setVisible(this.settings.showMagnifier !== false);

    this.inspector = new ElementInspector(this.shadowRoot);

    this.setupToolbar();
    this.setupToast();
    this.attachEventListeners();

    if (this.settings.useCrosshair !== false) {
      document.documentElement.style.setProperty(
        "cursor",
        "crosshair",
        "important",
      );
      document.body.style.setProperty("cursor", "crosshair", "important");
    }

    this.active = true;

    // Initial sample at center
    this.updateSample(this.clientX, this.clientY);
  }

  setupShadowDOM() {
    this.rootContainer = document.createElement("div");
    this.rootContainer.id = "pixel-color-root";
    this.rootContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483645;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    this.shadowRoot = this.rootContainer.attachShadow({ mode: "open" });

    // Inject base reset styling into shadow DOM
    const style = document.createElement("style");
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      .toolbar {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        pointer-events: auto;
        user-select: none;
        z-index: 2147483647;
        font-size: 13px;
        color: #1e293b;
        transition: opacity 0.15s ease;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        color: #0f172a;
        padding-right: 12px;
        border-right: 1px solid #e2e8f0;
      }
      .brand-dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        background: linear-gradient(135deg, #ef4444, #3b82f6);
      }
      .section {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .swatch {
        width: 26px;
        height: 26px;
        min-width: 26px;
        min-height: 26px;
        max-width: 26px;
        max-height: 26px;
        aspect-ratio: 1 / 1;
        flex-shrink: 0;
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
      }
      .color-values {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .hex-val {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 700;
        font-size: 13px;
        color: #0f172a;
      }
      .sub-val {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 11px;
        color: #64748b;
      }
      .element-badge {
        background: #f1f5f9;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 11px;
        color: #475569;
        max-width: 160px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: ui-monospace, SFMono-Regular, monospace;
      }
      select, button {
        font-family: inherit;
        font-size: 12px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        padding: 5px 8px;
        color: #334155;
        cursor: pointer;
        outline: none;
        transition: all 0.15s;
      }
      select:hover, button:hover {
        border-color: #94a3b8;
        background: #f8fafc;
      }
      button.btn-primary {
        background: #3b82f6;
        color: #ffffff;
        border-color: #2563eb;
        font-weight: 500;
      }
      button.btn-primary:hover {
        background: #2563eb;
      }
      .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #ffffff;
        padding: 8px 18px;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        pointer-events: none;
        display: none;
        z-index: 2147483647;
      }
    `;
    this.shadowRoot.appendChild(style);

    document.documentElement.appendChild(this.rootContainer);
  }

  setupToolbar() {
    this.toolbar = document.createElement("div");
    this.toolbar.className = "toolbar";

    this.toolbar.innerHTML = `
      <div class="brand">
        <div class="brand-dot"></div>
        <span>Pixel Color</span>
      </div>

      <div class="section">
        <label style="font-size: 11px; color: #64748b;">Sample:</label>
        <select id="sample-size-select">
          <option value="1">1 × 1</option>
          <option value="3">3 × 3</option>
          <option value="5">5 × 5</option>
          <option value="11">11 × 11</option>
          <option value="25">25 × 25</option>
        </select>
      </div>

      <div class="section" style="padding-left: 6px; border-left: 1px solid #e2e8f0;">
        <div class="swatch" id="toolbar-swatch"></div>
        <div class="color-values">
          <span class="hex-val" id="toolbar-hex">#000000</span>
          <span class="sub-val" id="toolbar-sub">rgb(0, 0, 0)</span>
        </div>
      </div>

      <div class="section" style="padding-left: 6px; border-left: 1px solid #e2e8f0;">
        <div class="element-badge" id="toolbar-element">BODY</div>
      </div>

      <div class="section" style="padding-left: 6px; border-left: 1px solid #e2e8f0; gap: 6px;">
        <button id="btn-refresh" title="Refresh screenshot (R)">Refresh</button>
        <button id="btn-close" title="Exit picker (Esc)">Close</button>
      </div>
    `;

    this.shadowRoot.appendChild(this.toolbar);

    // Set initial select value
    const sizeSelect = this.shadowRoot.getElementById("sample-size-select");
    sizeSelect.value = String(this.sampleSize);
    sizeSelect.addEventListener("change", (e) => {
      this.sampleSize = parseInt(e.target.value, 10) || 1;
      this.updateSample(this.clientX, this.clientY);
    });

    this.shadowRoot
      .getElementById("btn-refresh")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        this.recaptureScreenshot();
      });

    this.shadowRoot
      .getElementById("btn-close")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        this.cleanup();
      });
  }

  setupToast() {
    this.toast = document.createElement("div");
    this.toast.className = "toast";
    this.shadowRoot.appendChild(this.toast);
  }

  showToast(message, duration = 1800) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.style.display = "block";
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      if (this.toast) this.toast.style.display = "none";
    }, duration);
  }

  attachEventListeners() {
    window.addEventListener("mousemove", this.handleMouseMove, {
      capture: true,
      passive: true,
    });
    window.addEventListener("click", this.handleClick, { capture: true });
    window.addEventListener("keydown", this.handleKeyDown, { capture: true });
    window.addEventListener("scroll", this.handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", this.handleResize, {
      capture: true,
      passive: true,
    });
  }

  detachEventListeners() {
    window.removeEventListener("mousemove", this.handleMouseMove, {
      capture: true,
    });
    window.removeEventListener("click", this.handleClick, { capture: true });
    window.removeEventListener("keydown", this.handleKeyDown, {
      capture: true,
    });
    window.removeEventListener("scroll", this.handleScroll, { capture: true });
    window.removeEventListener("resize", this.handleResize, { capture: true });
  }

  handleMouseMove(e) {
    if (!this.active || this.isRecapturing) return;

    this.clientX = e.clientX;
    this.clientY = e.clientY;

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.updateSample(this.clientX, this.clientY);
      });
    }
  }

  updateSample(clientX, clientY) {
    if (!this.active || !this.sampler) return;

    // Sample color
    this.currentColor = this.sampler.sampleColor(
      clientX,
      clientY,
      this.sampleSize,
      this.sampleMode,
    );

    // Update magnifier
    if (this.magnifier) {
      const patch = this.sampler.getMagnifierPatch(clientX, clientY, 11);
      this.magnifier.render(
        patch,
        this.currentColor,
        clientX,
        clientY,
        this.sampleSize,
      );
    }

    // Inspect element under pointer
    if (this.inspector) {
      this.currentElementInfo = this.inspector.inspect(
        clientX,
        clientY,
        this.settings.outlineHoveredElement !== false,
      );
    }

    // Update toolbar
    this.updateToolbar(this.currentColor, this.currentElementInfo);
  }

  updateToolbar(color, elementInfo) {
    if (!this.shadowRoot || !color) return;

    const swatch = this.shadowRoot.getElementById("toolbar-swatch");
    const hexEl = this.shadowRoot.getElementById("toolbar-hex");
    const subEl = this.shadowRoot.getElementById("toolbar-sub");
    const elemEl = this.shadowRoot.getElementById("toolbar-element");

    if (swatch) swatch.style.backgroundColor = color.hex;
    if (hexEl) hexEl.textContent = color.hex;
    if (subEl) subEl.textContent = formatColor(color, "rgb");

    if (elemEl) {
      if (elementInfo) {
        elemEl.textContent = `${elementInfo.selector} (${elementInfo.width}×${elementInfo.height})`;
      } else {
        elemEl.textContent = "PAGE";
      }
    }
  }

  async handleClick(e) {
    if (!this.active || this.isRecapturing) return;

    // Check if clicked inside shadow DOM toolbar
    if (e.composedPath().some((el) => el === this.toolbar)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    await this.pickCurrentColor();
  }

  async pickCurrentColor() {
    if (!this.currentColor) return;

    const formatted = formatColor(
      this.currentColor,
      this.settings.copyFormat || "hex-upper",
    );

    // Auto-copy if enabled
    if (this.settings.autoCopy !== false) {
      await copyToClipboard(formatted);
    }

    // Send picked color to background for history storage
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.COLOR_PICKED,
          payload: {
            color: this.currentColor,
            sourceDomain: window.location.hostname || "page",
            sourceType: "page",
          },
        });
      }
    } catch (e) {
      console.warn("Could not notify background service worker:", e);
    }

    this.showToast(`Picked ${formatted}!`);

    // Check afterPick setting
    if (this.settings.afterPick !== "continue") {
      setTimeout(() => {
        this.cleanup();
      }, 300);
    }
  }

  handleKeyDown(e) {
    if (!this.active) return;

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.cleanup();
      return;
    }

    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      this.recaptureScreenshot();
      return;
    }

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.pickCurrentColor();
      return;
    }

    if (e.key === "Shift") {
      // Toggle magnifier temporary visibility
      if (this.magnifier) {
        this.magnifier.setVisible(!this.magnifier.visible);
      }
      return;
    }

    // Arrow navigation
    let step = e.shiftKey ? 10 : 1;
    let dx = 0;
    let dy = 0;

    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;

    if (dx !== 0 || dy !== 0) {
      e.preventDefault();
      this.clientX = Math.max(
        0,
        Math.min(window.innerWidth, this.clientX + dx),
      );
      this.clientY = Math.max(
        0,
        Math.min(window.innerHeight, this.clientY + dy),
      );
      this.updateSample(this.clientX, this.clientY);
    }
  }

  handleScroll() {
    if (!this.active) return;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.recaptureScreenshot();
    }, 150);
  }

  handleResize() {
    if (!this.active) return;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.recaptureScreenshot();
    }, 150);
  }

  async recaptureScreenshot() {
    if (!this.active || this.isRecapturing) return;
    this.isRecapturing = true;

    this.showToast("Refreshing sample…", 1000);

    // 1. Hide overlay elements so they don't contaminate screenshot
    if (this.rootContainer) {
      this.rootContainer.style.display = "none";
    }

    // 2. Wait a frame
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // 3. Request fresh capture from service worker
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        const response = await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.REQUEST_SCREENSHOT,
        });
        if (response && response.dataUrl) {
          this.currentDataUrl = response.dataUrl;
          await this.sampler.load(
            this.currentDataUrl,
            window.innerWidth,
            window.innerHeight,
          );
        }
      }
    } catch (err) {
      console.warn("Screenshot recapture failed:", err);
    } finally {
      // 4. Restore overlay
      if (this.rootContainer) {
        this.rootContainer.style.display = "block";
      }
      this.isRecapturing = false;
      this.updateSample(this.clientX, this.clientY);
    }
  }

  cleanup() {
    this.active = false;
    this.detachEventListeners();

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.toastTimeout);

    if (this.magnifier) {
      this.magnifier.cleanup();
      this.magnifier = null;
    }

    if (this.inspector) {
      this.inspector.cleanup();
      this.inspector = null;
    }

    if (this.sampler) {
      this.sampler.cleanup();
      this.sampler = null;
    }

    if (this.rootContainer && this.rootContainer.parentNode) {
      this.rootContainer.parentNode.removeChild(this.rootContainer);
    }
    this.rootContainer = null;
    this.shadowRoot = null;
    this.toolbar = null;

    // Reset document cursor
    document.documentElement.style.removeProperty("cursor");
    document.body.style.removeProperty("cursor");

    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        chrome.runtime.sendMessage({ type: MESSAGE_TYPES.PICKER_CLOSED });
      }
    } catch (e) {
      // Ignore
    }

    window.__pixelColorPickerInstance = null;
  }
}
