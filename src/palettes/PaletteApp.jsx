import React, { useState } from "react";
import { Copy, Save, Download, Sparkles } from "lucide-react";
import styles from "./PaletteApp.module.css";
import { PRESET_PALETTES } from "./presets.js";
import { parseCssColor, getStandardColorName } from "../color/colorParser.js";
import { formatColor } from "../color/colorFormatter.js";
import { contrastRatio } from "../color/colorMath.js";
import { copyToClipboard } from "../shared/clipboard.js";
import { addColorToHistory } from "../storage/historyStore.js";

export function PaletteApp() {
  const [activePalette, setActivePalette] = useState(PRESET_PALETTES[0]);
  const [selectedHex, setSelectedHex] = useState(PRESET_PALETTES[0].colors[0]);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const selectedColor = parseCssColor(selectedHex);
  const colorName = getStandardColorName(selectedHex);

  const whiteContrast = selectedColor
    ? contrastRatio(selectedColor, { r: 255, g: 255, b: 255 })
    : null;
  const blackContrast = selectedColor
    ? contrastRatio(selectedColor, { r: 0, g: 0, b: 0 })
    : null;

  const handleCopy = async (color, format = "hex-upper") => {
    const text = formatColor(color, format);
    await copyToClipboard(text);
    showToast(`Copied ${text}`);
  };

  const handleSaveToHistory = async (color) => {
    await addColorToHistory(color, {
      domain: activePalette.name,
      type: "palette",
    });
    showToast(`Saved ${color.hex} to History!`);
  };

  const handleExportPalette = (format) => {
    let output = "";
    const nameSlug = activePalette.name.toLowerCase().replace(/\s+/g, "-");

    if (format === "css") {
      const vars = activePalette.colors
        .map((hex, idx) => `  --color-${nameSlug}-${idx + 1}: ${hex};`)
        .join("\n");
      output = `:root {\n${vars}\n}`;
    } else if (format === "scss") {
      output = activePalette.colors
        .map((hex, idx) => `$color-${nameSlug}-${idx + 1}: ${hex};`)
        .join("\n");
    } else if (format === "tailwind") {
      const entries = activePalette.colors
        .map((hex, idx) => `      '${nameSlug}-${idx + 1}': '${hex}',`)
        .join("\n");
      output = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      }\n    }\n  }\n};`;
    } else {
      output = JSON.stringify(activePalette, null, 2);
    }

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nameSlug}.${format === "tailwind" ? "js" : format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${activePalette.name} as ${format.toUpperCase()}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/icons/icon32.png" alt="Logo" className={styles.logoIcon} />
          <span>Pixel Color</span>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Palette Browser</h1>
            <p className={styles.subtitle}>
              Curated original palettes, contrast ratios, and design exports
            </p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left Sidebar: Palettes List */}
          <div className={styles.sidebar}>
            {PRESET_PALETTES.map((pal) => (
              <div
                key={pal.id}
                className={`${styles.paletteNavItem} ${activePalette.id === pal.id ? styles.active : ""}`}
                onClick={() => {
                  setActivePalette(pal);
                  setSelectedHex(pal.colors[0]);
                }}
              >
                <span className={styles.paletteName}>{pal.name}</span>
                <div className={styles.paletteStrip}>
                  {pal.colors.slice(0, 8).map((hex, idx) => (
                    <div
                      key={idx}
                      className={styles.paletteStripColor}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Main: Active Palette Grid & Inspector */}
          <div className={styles.contentCard}>
            <div className={styles.paletteHeader}>
              <div>
                <h2>{activePalette.name}</h2>
                <p className={styles.paletteDesc}>
                  {activePalette.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className={styles.btnAction}
                  onClick={() => handleExportPalette("css")}
                  title="Export CSS Variables"
                >
                  <Download size={14} /> CSS
                </button>
                <button
                  className={styles.btnAction}
                  onClick={() => handleExportPalette("tailwind")}
                  title="Export Tailwind Config"
                >
                  <Download size={14} /> Tailwind
                </button>
                <button
                  className={styles.btnAction}
                  onClick={() => handleExportPalette("json")}
                  title="Export JSON"
                >
                  <Download size={14} /> JSON
                </button>
              </div>
            </div>

            {/* Colors Grid */}
            <div className={styles.colorGrid}>
              {activePalette.colors.map((hex) => (
                <div
                  key={hex}
                  className={`${styles.colorCell} ${selectedHex === hex ? styles.selected : ""}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => setSelectedHex(hex)}
                  title={hex}
                />
              ))}
            </div>

            {/* Color Detail Box */}
            {selectedColor && (
              <div className={styles.detailBox}>
                <div
                  className={styles.detailSwatch}
                  style={{ backgroundColor: selectedColor.hex }}
                />

                <div className={styles.detailMeta}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span className={styles.detailHex}>
                      {selectedColor.hex}
                    </span>
                    {colorName && (
                      <span className={styles.detailName}>"{colorName}"</span>
                    )}
                  </div>
                  <span className={styles.detailSub}>
                    {formatColor(selectedColor, "rgb")}
                  </span>
                  <span className={styles.detailSub}>
                    {formatColor(selectedColor, "hsl")}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#64748b",
                    }}
                  >
                    <span>
                      Contrast vs White: <strong>{whiteContrast}:1</strong>
                    </span>
                    <span>
                      Contrast vs Black: <strong>{blackContrast}:1</strong>
                    </span>
                  </div>
                </div>

                <div className={styles.detailActions}>
                  <button
                    className={styles.btnAction}
                    onClick={() => handleCopy(selectedColor, "hex-upper")}
                  >
                    <Copy size={14} /> Copy HEX
                  </button>
                  <button
                    className={styles.btnAction}
                    onClick={() => handleCopy(selectedColor, "rgb")}
                  >
                    <Copy size={14} /> Copy RGB
                  </button>
                  <button
                    className={styles.btnAction}
                    onClick={() => handleSaveToHistory(selectedColor)}
                  >
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
