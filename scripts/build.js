import { build } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function buildAll() {
  try {
    console.log("1. Building multi-page HTML apps...");
    await build({
      root: rootDir,
      plugins: [react()],
      build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
          input: {
            popup: path.resolve(rootDir, "popup.html"),
            "color-picker": path.resolve(rootDir, "color-picker.html"),
            history: path.resolve(rootDir, "history.html"),
            analyzer: path.resolve(rootDir, "analyzer.html"),
            palettes: path.resolve(rootDir, "palettes.html"),
            gradient: path.resolve(rootDir, "gradient.html"),
            options: path.resolve(rootDir, "options.html"),
          },
        },
      },
    });
  } catch (err) {
    console.error("STEP 1 ERROR:", err);
    throw err;
  }

  try {
    console.log("2. Building standalone injected Picker bundle (IIFE)...");
    await build({
      root: rootDir,
      configFile: false,
      plugins: [],
      build: {
        outDir: path.resolve(rootDir, "dist/src/picker"),
        emptyOutDir: false,
        lib: {
          entry: path.resolve(rootDir, "src/picker/startPicker.js"),
          name: "PixelColorPickerBundle",
          formats: ["iife"],
          fileName: () => "picker.bundle.js",
        },
      },
    });
  } catch (err) {
    console.error("STEP 2 ERROR:", err);
    throw err;
  }

  try {
    console.log("3. Building standalone injected Scanner bundle (IIFE)...");
    await build({
      root: rootDir,
      configFile: false,
      plugins: [],
      build: {
        outDir: path.resolve(rootDir, "dist/src/analyzer"),
        emptyOutDir: false,
        lib: {
          entry: path.resolve(rootDir, "src/analyzer/scanPageColors.js"),
          name: "PixelColorScannerBundle",
          formats: ["iife"],
          fileName: () => "scanPageColors.bundle.js",
        },
      },
    });
  } catch (err) {
    console.error("STEP 3 ERROR:", err);
    throw err;
  }

  try {
    console.log("4. Building standalone injected Highlighter bundle (IIFE)...");
    await build({
      root: rootDir,
      configFile: false,
      plugins: [],
      build: {
        outDir: path.resolve(rootDir, "dist/src/analyzer"),
        emptyOutDir: false,
        lib: {
          entry: path.resolve(rootDir, "src/analyzer/highlightColor.js"),
          name: "PixelColorHighlighterBundle",
          formats: ["iife"],
          fileName: () => "highlightColor.bundle.js",
        },
      },
    });
  } catch (err) {
    console.error("STEP 4 ERROR:", err);
    throw err;
  }

  try {
    console.log("5. Building standalone Service Worker (ES Module)...");
    await build({
      root: rootDir,
      configFile: false,
      plugins: [],
      build: {
        outDir: path.resolve(rootDir, "dist/src/background"),
        emptyOutDir: false,
        lib: {
          entry: path.resolve(rootDir, "src/background/service-worker.js"),
          formats: ["es"],
          fileName: () => "service-worker.js",
        },
      },
    });
  } catch (err) {
    console.error("STEP 5 ERROR:", err);
    throw err;
  }

  console.log("\n✓ All extension bundles built successfully!");
}

buildAll().catch((err) => {
  console.error("GLOBAL BUILD ERROR:", err && err.message ? err.message : err);
  process.exit(1);
});
