import React, { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Save, Sparkles, RefreshCw } from "lucide-react";
import styles from "./ColorPickerApp.module.css";
import {
  hsvToRgb,
  rgbToHsv,
  rgbToHsl,
  hslToRgb,
  createColorModel,
  clamp,
} from "../color/colorMath.js";
import { parseCssColor } from "../color/colorParser.js";
import { formatColor } from "../color/colorFormatter.js";
import { copyToClipboard } from "../shared/clipboard.js";
import { addColorToHistory } from "../storage/historyStore.js";

export function ColorPickerApp() {
  // HSV state: h (0-360), s (0-100), v (0-100), a (0-1)
  const [hsv, setHsv] = useState({ h: 200, s: 70, v: 85, a: 1 });
  const [initialColor, setInitialColor] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [manualInputError, setManualInputError] = useState(false);
  const [toast, setToast] = useState("");

  const svSquareRef = useRef(null);
  const hueSliderRef = useRef(null);
  const alphaSliderRef = useRef(null);
  const isDraggingSV = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingAlpha = useRef(false);

  // Compute current color model
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const colorModel = createColorModel({ ...rgb, a: hsv.a });

  // Initial color snapshot for Current/New comparison
  useEffect(() => {
    if (!initialColor) {
      setInitialColor(colorModel);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // SV dragging handler
  const handleSVMove = useCallback((clientX, clientY) => {
    if (!svSquareRef.current) return;
    const rect = svSquareRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    setHsv((prev) => ({ ...prev, s, v }));
  }, []);

  // Hue slider handler
  const handleHueMove = useCallback((clientX) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const h = Math.round((x / rect.width) * 360) % 360;

    setHsv((prev) => ({ ...prev, h }));
  }, []);

  // Alpha slider handler
  const handleAlphaMove = useCallback((clientX) => {
    if (!alphaSliderRef.current) return;
    const rect = alphaSliderRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const a = Math.round((x / rect.width) * 100) / 100;

    setHsv((prev) => ({ ...prev, a }));
  }, []);

  // Global mouse event listeners for smooth drag outside elements
  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingSV.current) handleSVMove(e.clientX, e.clientY);
      if (isDraggingHue.current) handleHueMove(e.clientX);
      if (isDraggingAlpha.current) handleAlphaMove(e.clientX);
    };

    const onMouseUp = () => {
      isDraggingSV.current = false;
      isDraggingHue.current = false;
      isDraggingAlpha.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleSVMove, handleHueMove, handleAlphaMove]);

  // Handle Manual Color Parsing
  const handleManualInputSubmit = (e) => {
    e.preventDefault();
    const parsed = parseCssColor(manualInput);
    if (parsed) {
      setManualInputError(false);
      setHsv({
        h: parsed.hsv.h,
        s: parsed.hsv.s,
        v: parsed.hsv.v,
        a: parsed.a !== undefined ? parsed.a : 1,
      });
      setManualInput("");
      showToast(`Loaded ${parsed.hex}`);
    } else {
      setManualInputError(true);
    }
  };

  // Direct Channel Updaters
  const handleHexChange = (e) => {
    const val = e.target.value;
    const parsed = parseCssColor(val);
    if (parsed) {
      setHsv((prev) => ({
        ...prev,
        h: parsed.hsv.h,
        s: parsed.hsv.s,
        v: parsed.hsv.v,
      }));
    }
  };

  const handleRgbChannelChange = (channel, val) => {
    const num = clamp(parseInt(val, 10) || 0, 0, 255);
    const newRgb = { ...rgb, [channel]: num };
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHsv((prev) => ({ ...prev, ...newHsv }));
  };

  const handleHslChannelChange = (channel, val) => {
    const currentHsl = colorModel.hsl;
    const maxVal = channel === "h" ? 360 : 100;
    const num = clamp(parseInt(val, 10) || 0, 0, maxVal);
    const newHsl = { ...currentHsl, [channel]: num };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHsv((prev) => ({ ...prev, ...newHsv }));
  };

  const handleSaveToHistory = async () => {
    await addColorToHistory(colorModel, {
      domain: "Color Picker",
      type: "manual",
    });
    showToast(`Saved ${colorModel.hex} to History!`);
  };

  const handleCopy = async (format) => {
    const text = formatColor(colorModel, format);
    await copyToClipboard(text);
    showToast(`Copied ${text}`);
  };

  // Color adjustments
  const adjustColor = (type) => {
    if (type === "invert") {
      const invR = 255 - rgb.r;
      const invG = 255 - rgb.g;
      const invB = 255 - rgb.b;
      const newHsv = rgbToHsv(invR, invG, invB);
      setHsv((prev) => ({ ...prev, ...newHsv }));
    } else if (type === "lighten") {
      const hsl = colorModel.hsl;
      const newL = clamp(hsl.l + 10, 0, 100);
      const newRgb = hslToRgb(hsl.h, hsl.s, newL);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHsv((prev) => ({ ...prev, ...newHsv }));
    } else if (type === "darken") {
      const hsl = colorModel.hsl;
      const newL = clamp(hsl.l - 10, 0, 100);
      const newRgb = hslToRgb(hsl.h, hsl.s, newL);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHsv((prev) => ({ ...prev, ...newHsv }));
    } else if (type === "saturate") {
      setHsv((prev) => ({ ...prev, s: clamp(prev.s + 15, 0, 100) }));
    } else if (type === "desaturate") {
      setHsv((prev) => ({ ...prev, s: clamp(prev.s - 15, 0, 100) }));
    }
  };

  // Pure Hue RGB for SV square background
  const pureHueRgb = hsvToRgb(hsv.h, 100, 100);
  const pureHueHex = formatColor(createColorModel(pureHueRgb), "hex-upper");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/icons/icon32.png" alt="Logo" className={styles.logoIcon} />
          <span>Pixel Color</span>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Advanced Color Picker</h1>
          <p className={styles.subtitle}>
            Precision 2D color selection, real-time channel sync, and color
            adjustments
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Visual Selectors */}
          <div className={styles.card}>
            {/* 2D SV Square */}
            <div
              ref={svSquareRef}
              className={styles.svSquare}
              style={{ backgroundColor: pureHueHex }}
              onMouseDown={(e) => {
                isDraggingSV.current = true;
                handleSVMove(e.clientX, e.clientY);
              }}
            >
              <div className={styles.svGradientWhite} />
              <div className={styles.svGradientBlack} />
              <div
                className={styles.svHandle}
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: colorModel.hex,
                }}
              />
            </div>

            {/* Sliders */}
            <div className={styles.slidersContainer}>
              {/* Hue Slider */}
              <div
                ref={hueSliderRef}
                className={`${styles.sliderTrack} ${styles.hueTrack}`}
                onMouseDown={(e) => {
                  isDraggingHue.current = true;
                  handleHueMove(e.clientX);
                }}
              >
                <div
                  className={styles.sliderHandle}
                  style={{ left: `${(hsv.h / 360) * 100}%` }}
                />
              </div>

              {/* Alpha Slider */}
              <div
                ref={alphaSliderRef}
                className={`${styles.sliderTrack} ${styles.alphaTrack}`}
                onMouseDown={(e) => {
                  isDraggingAlpha.current = true;
                  handleAlphaMove(e.clientX);
                }}
              >
                <div
                  className={styles.alphaOverlay}
                  style={{
                    background: `linear-gradient(to right, transparent, ${colorModel.hex})`,
                  }}
                />
                <div
                  className={styles.sliderHandle}
                  style={{ left: `${hsv.a * 100}%` }}
                />
              </div>
            </div>

            {/* Color Adjustment Tools */}
            <div className={styles.presetsSection}>
              <div className={styles.presetsTitle}>Quick Adjustments</div>
              <div className={styles.presetsGrid}>
                <button
                  className={styles.presetButton}
                  onClick={() => adjustColor("lighten")}
                >
                  + Lighten
                </button>
                <button
                  className={styles.presetButton}
                  onClick={() => adjustColor("darken")}
                >
                  - Darken
                </button>
                <button
                  className={styles.presetButton}
                  onClick={() => adjustColor("saturate")}
                >
                  + Saturate
                </button>
                <button
                  className={styles.presetButton}
                  onClick={() => adjustColor("desaturate")}
                >
                  - Desaturate
                </button>
                <button
                  className={styles.presetButton}
                  onClick={() => adjustColor("invert")}
                >
                  Invert
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Values & Inputs */}
          <div className={`${styles.card} ${styles.detailsSection}`}>
            {/* Comparison Swatches */}
            <div className={styles.comparisonBar}>
              {initialColor && (
                <div className={styles.swatchBox}>
                  <span className={styles.swatchLabel}>Original</span>
                  <div className={styles.swatchLarge}>
                    <div className={styles.checkerBg} />
                    <div
                      className={styles.swatchFill}
                      style={{ backgroundColor: initialColor.hex8 }}
                    />
                  </div>
                </div>
              )}
              <div className={styles.swatchBox}>
                <span className={styles.swatchLabel}>Current</span>
                <div className={styles.swatchLarge}>
                  <div className={styles.checkerBg} />
                  <div
                    className={styles.swatchFill}
                    style={{ backgroundColor: colorModel.hex8 }}
                  />
                </div>
              </div>
            </div>

            {/* Manual Color Input */}
            <form
              onSubmit={handleManualInputSubmit}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter HEX, RGB, HSL, or named color…"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                style={{
                  borderColor: manualInputError ? "#ef4444" : undefined,
                }}
              />
              <button type="submit" className={styles.btnSecondary}>
                <RefreshCw size={14} />
                Load
              </button>
            </form>
            {manualInputError && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#ef4444",
                  marginTop: "-14px",
                }}
              >
                Invalid color value. Try #3b82f6, rgb(59, 130, 246) or tomato.
              </span>
            )}

            {/* Synchronized Channel Inputs */}
            <div className={styles.inputsGroup}>
              {/* HEX */}
              <div className={styles.inputRow}>
                <span className={styles.inputLabel}>HEX</span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={hsv.a < 1 ? colorModel.hex8 : colorModel.hex}
                  onChange={handleHexChange}
                />
              </div>

              {/* RGB */}
              <div className={styles.inputRow}>
                <span className={styles.inputLabel}>RGB</span>
                <div className={styles.channelGrid}>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    className={styles.channelInput}
                    value={rgb.r}
                    onChange={(e) =>
                      handleRgbChannelChange("r", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    className={styles.channelInput}
                    value={rgb.g}
                    onChange={(e) =>
                      handleRgbChannelChange("g", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    className={styles.channelInput}
                    value={rgb.b}
                    onChange={(e) =>
                      handleRgbChannelChange("b", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* HSL */}
              <div className={styles.inputRow}>
                <span className={styles.inputLabel}>HSL</span>
                <div className={styles.channelGrid}>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    className={styles.channelInput}
                    value={colorModel.hsl.h}
                    onChange={(e) =>
                      handleHslChannelChange("h", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={styles.channelInput}
                    value={colorModel.hsl.s}
                    onChange={(e) =>
                      handleHslChannelChange("s", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={styles.channelInput}
                    value={colorModel.hsl.l}
                    onChange={(e) =>
                      handleHslChannelChange("l", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* HSV */}
              <div className={styles.inputRow}>
                <span className={styles.inputLabel}>HSV</span>
                <div className={styles.channelGrid}>
                  <input
                    type="text"
                    readOnly
                    className={styles.channelInput}
                    value={`${hsv.h}°`}
                  />
                  <input
                    type="text"
                    readOnly
                    className={styles.channelInput}
                    value={`${hsv.s}%`}
                  />
                  <input
                    type="text"
                    readOnly
                    className={styles.channelInput}
                    value={`${hsv.v}%`}
                  />
                </div>
              </div>

              {/* Alpha */}
              <div className={styles.inputRow}>
                <span className={styles.inputLabel}>Alpha</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={styles.inputField}
                  value={Math.round(hsv.a * 100)}
                  onChange={(e) => {
                    const pct = clamp(
                      parseInt(e.target.value, 10) || 0,
                      0,
                      100,
                    );
                    setHsv((prev) => ({ ...prev, a: pct / 100 }));
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionsBar}>
              <button
                className={styles.btnPrimary}
                onClick={() => handleCopy("hex-upper")}
              >
                <Copy size={14} />
                Copy HEX
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => handleCopy(hsv.a < 1 ? "rgba" : "rgb")}
              >
                <Copy size={14} />
                Copy RGB
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => handleCopy(hsv.a < 1 ? "hsla" : "hsl")}
              >
                <Copy size={14} />
                Copy HSL
              </button>
              <button
                className={styles.btnSecondary}
                onClick={handleSaveToHistory}
              >
                <Save size={14} />
                Save to History
              </button>
            </div>
          </div>
        </div>
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
