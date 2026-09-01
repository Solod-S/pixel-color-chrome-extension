/**
 * Formats a color model object into different string formats.
 */

export function formatColor(color, format = "hex-upper") {
  if (!color) return "";

  const { r, g, b, a = 1, hex, hex8, hsl, hsv } = color;

  switch (format) {
    case "hex-upper":
      return hex ? hex.toUpperCase() : "#000000";

    case "hex-lower":
      return hex ? hex.toLowerCase() : "#000000";

    case "hex8":
      return hex8 ? hex8.toUpperCase() : "#000000FF";

    case "hex8-lower":
      return hex8 ? hex8.toLowerCase() : "#000000ff";

    case "rgb":
      return `rgb(${r}, ${g}, ${b})`;

    case "rgba":
      return `rgba(${r}, ${g}, ${b}, ${a})`;

    case "hsl": {
      const h = hsl ? hsl.h : 0;
      const s = hsl ? hsl.s : 0;
      const l = hsl ? hsl.l : 0;
      return `hsl(${h}, ${s}%, ${l}%)`;
    }

    case "hsla": {
      const h = hsl ? hsl.h : 0;
      const s = hsl ? hsl.s : 0;
      const l = hsl ? hsl.l : 0;
      return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }

    case "hsv": {
      const h = hsv ? hsv.h : 0;
      const s = hsv ? hsv.s : 0;
      const v = hsv ? hsv.v : 0;
      return `hsv(${h}, ${s}%, ${v}%)`;
    }

    default:
      return hex || "#000000";
  }
}
