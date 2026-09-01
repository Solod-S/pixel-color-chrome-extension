/**
 * Math and conversion functions for colors.
 */

export function clamp(val, min = 0, max = 255) {
  if (Number.isNaN(val) || val === null || val === undefined) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Converts RGB components (0-255) to 6-char HEX string (#RRGGBB).
 */
export function rgbToHex(r, g, b, upper = true) {
  const cr = clamp(Math.round(r), 0, 255);
  const cg = clamp(Math.round(g), 0, 255);
  const cb = clamp(Math.round(b), 0, 255);

  const hex = [cr, cg, cb].map((x) => x.toString(16).padStart(2, "0")).join("");

  return upper ? `#${hex.toUpperCase()}` : `#${hex.toLowerCase()}`;
}

/**
 * Converts RGBA components to 8-char HEX string (#RRGGBBAA).
 * alpha: 0 to 1
 */
export function rgbaToHex8(r, g, b, a = 1, upper = true) {
  const cr = clamp(Math.round(r), 0, 255);
  const cg = clamp(Math.round(g), 0, 255);
  const cb = clamp(Math.round(b), 0, 255);
  const ca = clamp(Math.round(clamp(a, 0, 1) * 255), 0, 255);

  const hex = [cr, cg, cb, ca]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

  return upper ? `#${hex.toUpperCase()}` : `#${hex.toLowerCase()}`;
}

/**
 * Converts HEX string (#RGB, #RGBA, #RRGGBB, #RRGGBBAA) to RGBA object.
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") {
    return null;
  }

  let cleaned = hex.trim().replace(/^#/, "");

  // 3-digit: #RGB -> #RRGGBB
  if (cleaned.length === 3) {
    cleaned =
      cleaned
        .split("")
        .map((c) => c + c)
        .join("") + "FF";
  } else if (cleaned.length === 4) {
    // 4-digit: #RGBA -> #RRGGBBAA
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (cleaned.length === 6) {
    cleaned += "FF";
  } else if (cleaned.length !== 8) {
    return null;
  }

  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return null;

  const r = (num >> 24) & 255;
  const g = (num >> 16) & 255;
  const b = (num >> 8) & 255;
  const a = Math.round(((num & 255) / 255) * 100) / 100;

  return { r, g, b, a };
}

/**
 * Converts RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100).
 */
export function rgbToHsl(r, g, b) {
  const nr = clamp(r, 0, 255) / 255;
  const ng = clamp(g, 0, 255) / 255;
  const nb = clamp(b, 0, 255) / 255;

  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case nr:
        h = (ng - nb) / delta + (ng < nb ? 6 : 0);
        break;
      case ng:
        h = (nb - nr) / delta + 2;
        break;
      case nb:
        h = (nr - ng) / delta + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL (h: 0-360, s: 0-100, l: 0-100) to RGB (0-255).
 */
export function hslToRgb(h, s, l) {
  const nh = ((h % 360) + 360) % 360;
  const ns = clamp(s, 0, 100) / 100;
  const nl = clamp(l, 0, 100) / 100;

  if (ns === 0) {
    const val = Math.round(nl * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p, q, t) => {
    let nt = t;
    if (nt < 0) nt += 1;
    if (nt > 1) nt -= 1;
    if (nt < 1 / 6) return p + (q - p) * 6 * nt;
    if (nt < 1 / 2) return q;
    if (nt < 2 / 3) return p + (q - p) * (2 / 3 - nt) * 6;
    return p;
  };

  const q = nl < 0.5 ? nl * (1 + ns) : nl + ns - nl * ns;
  const p = 2 * nl - q;
  const k = nh / 360;

  const r = Math.round(hue2rgb(p, q, k + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, k) * 255);
  const b = Math.round(hue2rgb(p, q, k - 1 / 3) * 255);

  return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) };
}

/**
 * Converts RGB (0-255) to HSV/HSB (h: 0-360, s: 0-100, v: 0-100).
 */
export function rgbToHsv(r, g, b) {
  const nr = clamp(r, 0, 255) / 255;
  const ng = clamp(g, 0, 255) / 255;
  const nb = clamp(b, 0, 255) / 255;

  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case nr:
        h = (ng - nb) / delta + (ng < nb ? 6 : 0);
        break;
      case ng:
        h = (nb - nr) / delta + 2;
        break;
      case nb:
        h = (nr - ng) / delta + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Converts HSV (h: 0-360, s: 0-100, v: 0-100) to RGB (0-255).
 */
export function hsvToRgb(h, s, v) {
  const nh = ((h % 360) + 360) % 360;
  const ns = clamp(s, 0, 100) / 100;
  const nv = clamp(v, 0, 100) / 100;

  const c = nv * ns;
  const x = c * (1 - Math.abs(((nh / 60) % 2) - 1));
  const m = nv - c;

  let nr = 0;
  let ng = 0;
  let nb = 0;

  if (nh < 60) {
    nr = c;
    ng = x;
    nb = 0;
  } else if (nh < 120) {
    nr = x;
    ng = c;
    nb = 0;
  } else if (nh < 180) {
    nr = 0;
    ng = c;
    nb = x;
  } else if (nh < 240) {
    nr = 0;
    ng = x;
    nb = c;
  } else if (nh < 300) {
    nr = x;
    ng = 0;
    nb = c;
  } else {
    nr = c;
    ng = 0;
    nb = x;
  }

  return {
    r: clamp(Math.round((nr + m) * 255), 0, 255),
    g: clamp(Math.round((ng + m) * 255), 0, 255),
    b: clamp(Math.round((nb + m) * 255), 0, 255),
  };
}

/**
 * Converts HSV to HSL directly.
 */
export function hsvToHsl(h, s, v) {
  const ns = clamp(s, 0, 100) / 100;
  const nv = clamp(v, 0, 100) / 100;

  const l = nv * (1 - ns / 2);
  let sl = 0;
  if (l > 0 && l < 1) {
    sl = (nv - l) / Math.min(l, 1 - l);
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(sl * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to HSV directly.
 */
export function hslToHsv(h, s, l) {
  const ns = clamp(s, 0, 100) / 100;
  const nl = clamp(l, 0, 100) / 100;

  const v = nl + ns * Math.min(nl, 1 - nl);
  const sv = v === 0 ? 0 : 2 * (1 - nl / v);

  return {
    h: Math.round(h) % 360,
    s: Math.round(sv * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Averages an array of RGBA pixels.
 * @param {Array<{r: number, g: number, b: number, a?: number}>} pixels
 */
export function averagePixels(pixels) {
  if (!pixels || pixels.length === 0) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalA = 0;

  for (let i = 0; i < pixels.length; i++) {
    const p = pixels[i];
    totalR += p.r;
    totalG += p.g;
    totalB += p.b;
    totalA += p.a !== undefined ? p.a : 1;
  }

  const count = pixels.length;
  const r = Math.round(totalR / count);
  const g = Math.round(totalG / count);
  const b = Math.round(totalB / count);
  const a = Math.round((totalA / count) * 100) / 100;

  return {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
    a: clamp(a, 0, 1),
  };
}

/**
 * Calculates relative luminance for WCAG contrast ratio (0 to 1).
 */
export function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG contrast ratio between two RGB colors (1:1 to 21:1).
 */
export function contrastRatio(rgb1, rgb2) {
  const lum1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/**
 * Generates full color model from RGBA.
 */
export function createColorModel({ r, g, b, a = 1 }) {
  const cr = clamp(Math.round(r), 0, 255);
  const cg = clamp(Math.round(g), 0, 255);
  const cb = clamp(Math.round(b), 0, 255);
  const ca = clamp(typeof a === "number" ? Math.round(a * 100) / 100 : 1, 0, 1);

  const hex = rgbToHex(cr, cg, cb, true);
  const hex8 = rgbaToHex8(cr, cg, cb, ca, true);
  const hsl = rgbToHsl(cr, cg, cb);
  const hsv = rgbToHsv(cr, cg, cb);

  return {
    r: cr,
    g: cg,
    b: cb,
    a: ca,
    hex,
    hex8,
    hsl: { ...hsl, a: ca },
    hsv: { ...hsv, a: ca },
  };
}
