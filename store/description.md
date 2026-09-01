# Pixel Color — Chrome Web Store Listing

## Name

Pixel Color — Color Picker & Eyedropper

## Short Description

Pick colors from webpages, inspect pixels, analyze palettes and generate modern CSS gradients.

## Detailed Description

**Pixel Color** is an advanced, privacy-first color toolkit for frontend developers, UI/UX designers, and QA engineers.

Unlike basic pickers that simply read `background-color` CSS properties, Pixel Color uses true raster pixel sampling from the rendered viewport, allowing you to sample actual visual colors from images, video snapshots, SVG vectors, Canvas graphics, CSS gradients, and composited alpha-transparent elements.

### 🎯 Key Features & Tools

1. **Pick Color From Page (True Pixel Eyedropper)**
   - Raster screenshot sampling of visible viewport.
   - HiDPI and browser zoom coordinate scaling for pixel-perfect accuracy.
   - Precision Magnifier with pixel grid and target reticle.
   - Multi-pixel sample sizes: 1×1, 3×3, 5×5, 11×11, 25×25.
   - Sampling calculation modes: Average Color and Center Pixel.
   - Real-time DOM element inspector with tag, ID, class, and dimensions.
   - Non-intrusive hover outline.
   - Automatic debounced recapture on scroll or viewport resize without overlay contamination.
   - Keyboard shortcuts: `Esc` (exit), `R` (refresh), `Space`/`Enter` (pick), `Shift` (toggle magnifier), `Arrows` (1px / 10px nudge).

2. **Advanced Color Picker**
   - 2D Saturation-Value color square with smooth handle.
   - 1D Hue and Alpha sliders.
   - Real-time synchronized inputs: HEX, RGB, HSL, HSV, Alpha.
   - Quick color adjustments: Lighten, Darken, Saturate, Desaturate, and Invert.
   - Universal manual color parser accepting HEX, RGB, HSL, and named CSS colors.

3. **Picked Color History**
   - Stores picked colors locally in Chrome storage.
   - Captures color swatch, HEX, RGB, HSL, source domain, and timestamp.
   - Favorite star tagging.
   - Fast filtering and search.
   - Export history as JSON, CSV, or CSS custom properties.

4. **Webpage Color Analyzer**
   - Comprehensive DOM scanner extracting computed text, background, border, and SVG colors.
   - Groups colors by frequency and usage categories.
   - Interactive live highlight feature displaying matching elements directly on the active webpage.

5. **Palette Browser**
   - 8 curated original palette collections (Web Essentials, Nordic Pastel, Ocean Deep, Sunset Glow, Cyberpunk Neon, Monochrome Pro, Earthy Warmth, Emerald Forest).
   - Standard CSS color name recognition.
   - WCAG contrast ratio calculations against black and white.
   - One-click export to CSS variables, SCSS variables, Tailwind theme config, or JSON.

6. **CSS Gradient Generator**
   - Interactive visual color stop editor: add, drag, duplicate, or delete stops.
   - Linear and radial gradient engines with real-time preview.
   - Angle dial, direction presets, and shape positioning.
   - Generates clean, modern, vendor-prefix-free pure CSS.
   - Built-in gradient preset library.

7. **Options & Customization**
   - Configurable auto-copy formats (HEX upper/lower, RGB, RGBA, HSL, HSLA, HSV).
   - Customizable history limit (25, 50, 100, 250).
   - Global shortcut integration (`Alt+P`).

---

### 🔒 Privacy First

- 100% local in-browser processing.
- No analytics, telemetry, or third-party trackers.
- No backend servers, external cloud sync, or remote scripts.
- Temporary screenshot buffers are stored only in memory for sampling and immediately disposed of upon exiting the picker.
