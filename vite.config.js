import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        "color-picker": resolve(__dirname, "color-picker.html"),
        history: resolve(__dirname, "history.html"),
        analyzer: resolve(__dirname, "analyzer.html"),
        palettes: resolve(__dirname, "palettes.html"),
        gradient: resolve(__dirname, "gradient.html"),
        options: resolve(__dirname, "options.html"),
        "service-worker": resolve(
          __dirname,
          "src/background/service-worker.js",
        ),
        "start-picker": resolve(__dirname, "src/picker/startPicker.js"),
        "scan-page": resolve(__dirname, "src/analyzer/scanPageColors.js"),
        "highlight-color": resolve(__dirname, "src/analyzer/highlightColor.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "service-worker") {
            return "src/background/service-worker.js";
          }
          if (chunkInfo.name === "start-picker") {
            return "src/picker/picker.bundle.js";
          }
          if (chunkInfo.name === "scan-page") {
            return "src/analyzer/scanPageColors.bundle.js";
          }
          if (chunkInfo.name === "highlight-color") {
            return "src/analyzer/highlightColor.bundle.js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.{test,spec}.{js,jsx}"],
  },
});
