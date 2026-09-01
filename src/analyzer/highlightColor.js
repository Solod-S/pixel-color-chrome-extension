import { parseCssColor } from "../color/colorParser.js";

/**
 * Highlights elements on the live page that use the specified color.
 */
export function highlightColorOnPage(targetHex) {
  clearHighlights();

  if (!targetHex) return 0;
  const targetLower = targetHex.toLowerCase();

  const container = document.createElement("div");
  container.id = "pixel-color-highlights-root";
  container.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483640;
  `;

  const elements = document.querySelectorAll("*");
  let matchCount = 0;
  const maxHighlights = 300;

  for (let i = 0; i < elements.length && matchCount < maxHighlights; i++) {
    const el = elements[i];
    if (
      !el ||
      el.nodeType !== 1 ||
      el.id === "pixel-color-highlights-root" ||
      el.id === "pixel-color-root"
    ) {
      continue;
    }

    const style = window.getComputedStyle(el);
    if (!style || style.display === "none" || style.visibility === "hidden")
      continue;

    let isMatch = false;

    const check = (val) => {
      if (!val) return false;
      const parsed = parseCssColor(val);
      return parsed && parsed.hex.toLowerCase() === targetLower;
    };

    if (
      check(style.color) ||
      check(style.backgroundColor) ||
      check(style.borderTopColor) ||
      check(style.fill) ||
      check(style.stroke)
    ) {
      isMatch = true;
    }

    if (isMatch) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const marker = document.createElement("div");
        marker.style.cssText = `
          position: fixed;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border: 2px solid #ef4444;
          background-color: rgba(239, 68, 68, 0.15);
          box-sizing: border-box;
          border-radius: 2px;
          pointer-events: none;
          z-index: 2147483641;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        `;
        container.appendChild(marker);
        matchCount++;
      }
    }
  }

  document.body.appendChild(container);

  // Auto remove after 6 seconds
  setTimeout(() => {
    clearHighlights();
  }, 6000);

  return matchCount;
}

export function clearHighlights() {
  const existing = document.getElementById("pixel-color-highlights-root");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}

// Expose globally
window.__highlightColorOnPage = highlightColorOnPage;
window.__clearHighlights = clearHighlights;

// Injected message listener
if (
  typeof chrome !== "undefined" &&
  chrome.runtime &&
  chrome.runtime.onMessage
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === "HIGHLIGHT_COLOR") {
      const count = highlightColorOnPage(message.targetHex);
      sendResponse({ count });
    } else if (message && message.type === "CLEAR_HIGHLIGHTS") {
      clearHighlights();
      sendResponse({ status: "cleared" });
    }
  });
}
