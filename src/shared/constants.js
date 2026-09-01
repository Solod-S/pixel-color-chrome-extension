export const DEFAULT_SETTINGS = {
  showMagnifier: true,
  outlineHoveredElement: true,
  useCrosshair: true,
  autoCopy: true,
  copyFormat: "hex-upper",
  saveHistory: true,
  historyLimit: 50,
  sampleSize: 1,
  sampleMode: "average",
  afterPick: "exit",
};

export const SAMPLE_SIZES = [1, 3, 5, 11, 25];

export const SAMPLE_MODES = [
  { id: "average", label: "Average" },
  { id: "center", label: "Center Pixel" },
];

export const COPY_FORMATS = [
  { id: "hex-upper", label: "HEX Uppercase (#RRGGBB)" },
  { id: "hex-lower", label: "HEX Lowercase (#rrggbb)" },
  { id: "rgb", label: "RGB (rgb(r, g, b))" },
  { id: "rgba", label: "RGBA (rgba(r, g, b, a))" },
  { id: "hsl", label: "HSL (hsl(h, s%, l%))" },
  { id: "hsla", label: "HSLA (hsla(h, s%, l%, a))" },
  { id: "hsv", label: "HSV (hsv(h, s%, v%))" },
];

export const HISTORY_LIMITS = [25, 50, 100, 250];

export const AFTER_PICK_ACTIONS = [
  { id: "exit", label: "Exit picker" },
  { id: "continue", label: "Continue picking" },
];

export const STORAGE_KEYS = {
  SETTINGS: "pixel_color_settings",
  HISTORY: "pixel_color_history",
  FAVORITES: "pixel_color_favorites",
};
