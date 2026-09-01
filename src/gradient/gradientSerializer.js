import { rgbaToHex8, hexToRgb } from "../color/colorMath.js";
import { parseCssColor } from "../color/colorParser.js";

/**
 * Serializes gradient configuration model into modern, clean CSS background declaration.
 */
export function serializeGradientCss(gradient) {
  if (!gradient || !gradient.stops || gradient.stops.length < 2) {
    return "background: #000000;";
  }

  const {
    type = "linear",
    angle = 180,
    radialShape = "circle",
    radialPosition = "center",
    conicAngle = 0,
    stops,
  } = gradient;

  // Format stops
  const formattedStops = stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((stop) => {
      let colorStr = stop.color;
      const opacity = stop.opacity !== undefined ? stop.opacity : 1;

      if (opacity < 1) {
        const parsed = parseCssColor(stop.color);
        if (parsed) {
          colorStr = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${opacity})`;
        }
      }

      return `${colorStr} ${stop.position}%`;
    })
    .join(", ");

  if (type === "linear") {
    return `background: linear-gradient(${angle}deg, ${formattedStops});`;
  }

  if (type === "radial") {
    return `background: radial-gradient(${radialShape} at ${radialPosition}, ${formattedStops});`;
  }

  if (type === "conic") {
    return `background: conic-gradient(from ${conicAngle}deg, ${formattedStops});`;
  }

  return `background: linear-gradient(${angle}deg, ${formattedStops});`;
}
