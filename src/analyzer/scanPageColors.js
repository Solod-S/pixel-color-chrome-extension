import { parseCssColor } from '../color/colorParser.js';

/**
 * Scans DOM elements on the active webpage to extract and categorize computed colors.
 */
export function scanPageColors() {
  const elements = document.querySelectorAll('*');
  const colorMap = new Map();

  function recordUsage(colorStr, category) {
    if (!colorStr) return;
    const parsed = parseCssColor(colorStr);
    if (!parsed || parsed.isTransparent || parsed.a === 0) return;

    const hex = parsed.hex;
    if (!colorMap.has(hex)) {
      colorMap.set(hex, {
        color: parsed,
        hex,
        totalUses: 0,
        textUses: 0,
        backgroundUses: 0,
        borderUses: 0,
        svgUses: 0
      });
    }

    const item = colorMap.get(hex);
    item.totalUses++;
    if (category === 'text') item.textUses++;
    else if (category === 'background') item.backgroundUses++;
    else if (category === 'border') item.borderUses++;
    else if (category === 'svg') item.svgUses++;
  }

  // Iterate elements (up to 3000 elements for snappy performance)
  const maxElements = Math.min(elements.length, 3000);
  for (let i = 0; i < maxElements; i++) {
    const el = elements[i];
    if (!el || el.nodeType !== 1) continue;

    // Skip our own root if present
    if (el.id === 'pixel-color-root' || el.id === 'pixel-color-highlights-root') continue;

    const style = window.getComputedStyle(el);
    if (!style || style.display === 'none' || style.visibility === 'hidden') continue;

    // Text color (only if element has direct text or children)
    if (style.color && el.textContent.trim().length > 0) {
      recordUsage(style.color, 'text');
    }

    // Background color
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      recordUsage(style.backgroundColor, 'background');
    }

    // Borders
    if (style.borderTopWidth && parseInt(style.borderTopWidth, 10) > 0) {
      recordUsage(style.borderTopColor, 'border');
    }
    if (style.borderRightWidth && parseInt(style.borderRightWidth, 10) > 0) {
      recordUsage(style.borderRightColor, 'border');
    }
    if (style.borderBottomWidth && parseInt(style.borderBottomWidth, 10) > 0) {
      recordUsage(style.borderBottomColor, 'border');
    }
    if (style.borderLeftWidth && parseInt(style.borderLeftWidth, 10) > 0) {
      recordUsage(style.borderLeftColor, 'border');
    }

    // SVG
    if (el instanceof SVGElement) {
      if (style.fill && style.fill !== 'none' && style.fill !== 'transparent') {
        recordUsage(style.fill, 'svg');
      }
      if (style.stroke && style.stroke !== 'none' && style.stroke !== 'transparent') {
        recordUsage(style.stroke, 'svg');
      }
    }
  }

  const result = Array.from(colorMap.values());
  result.sort((a, b) => b.totalUses - a.totalUses);
  return result;
}

// Expose globally for chrome.scripting.executeScript
window.__scanPageColors = scanPageColors;

// Injected message listener
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'SCAN_DOM_COLORS') {
      const colors = scanPageColors();
      sendResponse({ colors, domain: window.location.hostname, title: document.title });
    }
  });
}
