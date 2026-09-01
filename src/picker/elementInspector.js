/**
 * Inspects DOM elements under cursor and manages a lightweight non-intrusive outline box.
 */
export class ElementInspector {
  constructor(shadowRoot) {
    this.shadowRoot = shadowRoot;
    this.outlineEl = document.createElement("div");
    this.outlineEl.style.position = "fixed";
    this.outlineEl.style.pointerEvents = "none";
    this.outlineEl.style.border = "2px solid #3b82f6";
    this.outlineEl.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
    this.outlineEl.style.borderRadius = "2px";
    this.outlineEl.style.zIndex = "2147483646";
    this.outlineEl.style.display = "none";
    this.outlineEl.style.boxSizing = "border-box";
    this.outlineEl.style.transition = "all 0.05s ease-out";

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(this.outlineEl);
    }
  }

  /**
   * Inspects element at client coordinates, ignoring pixel-color-root.
   */
  inspect(clientX, clientY, showOutline = true) {
    // Hide our outline element temporarily if needed for elementFromPoint
    this.outlineEl.style.display = "none";

    let el = document.elementFromPoint(clientX, clientY);

    // If element is our root container, drill through
    if (el && el.id === "pixel-color-root") {
      el = null;
    }

    if (!el || el === document.documentElement || el === document.body) {
      this.clearOutline();
      return null;
    }

    const rect = el.getBoundingClientRect();
    const tagName = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const classNames =
      el.className && typeof el.className === "string"
        ? "." +
          el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".")
        : "";

    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    const info = {
      element: el,
      tag: tagName.toUpperCase(),
      selector: `${tagName.toUpperCase()}${id}${classNames}`,
      width,
      height,
      rect,
    };

    if (showOutline && width > 0 && height > 0) {
      this.outlineEl.style.display = "block";
      this.outlineEl.style.left = `${rect.left}px`;
      this.outlineEl.style.top = `${rect.top}px`;
      this.outlineEl.style.width = `${rect.width}px`;
      this.outlineEl.style.height = `${rect.height}px`;
    } else {
      this.clearOutline();
    }

    return info;
  }

  clearOutline() {
    if (this.outlineEl) {
      this.outlineEl.style.display = "none";
    }
  }

  cleanup() {
    if (this.outlineEl && this.outlineEl.parentNode) {
      this.outlineEl.parentNode.removeChild(this.outlineEl);
    }
    this.outlineEl = null;
    this.shadowRoot = null;
  }
}
