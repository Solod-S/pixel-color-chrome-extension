import React, { useState, useEffect } from "react";
import { RotateCcw, Check, ExternalLink } from "lucide-react";
import styles from "./OptionsApp.module.css";
import {
  getSettings,
  saveSettings,
  resetSettings,
} from "../storage/settingsStore.js";
import {
  SAMPLE_SIZES,
  SAMPLE_MODES,
  COPY_FORMATS,
  HISTORY_LIMITS,
  AFTER_PICK_ACTIONS,
} from "../shared/constants.js";

export function OptionsApp() {
  const [settings, setSettings] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleToggle = async (key) => {
    if (!settings) return;
    const updated = await saveSettings({ [key]: !settings[key] });
    setSettings(updated);
    showToast("Setting updated");
  };

  const handleChange = async (key, value) => {
    if (!settings) return;
    const updated = await saveSettings({ [key]: value });
    setSettings(updated);
    showToast("Setting updated");
  };

  const handleReset = async () => {
    if (window.confirm("Reset all settings to defaults?")) {
      const defaults = await resetSettings();
      setSettings(defaults);
      showToast("Settings reset to defaults");
    }
  };

  if (!settings) return null;

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
          <h1 className={styles.title}>Extension Options</h1>
          <p className={styles.subtitle}>
            Customize eyedropper behavior, shortcuts, copy formats, and history
            limits
          </p>
        </div>

        {/* Eyedropper Appearance & Tools */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Eyedropper Behavior & UI</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Show Magnifier</span>
              <span className={styles.settingDesc}>
                Displays pixel-grid zoom loupe next to cursor
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.showMagnifier !== false}
                onChange={() => handleToggle("showMagnifier")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>
                Outline Hovered Element
              </span>
              <span className={styles.settingDesc}>
                Shows subtle border around DOM element under pointer
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.outlineHoveredElement !== false}
                onChange={() => handleToggle("outlineHoveredElement")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Use Crosshair Cursor</span>
              <span className={styles.settingDesc}>
                Changes cursor to precision crosshair while picker is active
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.useCrosshair !== false}
                onChange={() => handleToggle("useCrosshair")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Default Sample Size</span>
              <span className={styles.settingDesc}>
                Area of pixels sampled under the pointer
              </span>
            </div>
            <select
              className={styles.selectInput}
              value={settings.sampleSize || 1}
              onChange={(e) =>
                handleChange("sampleSize", parseInt(e.target.value, 10))
              }
            >
              {SAMPLE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} × {s} pixels
                </option>
              ))}
            </select>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>
                Sampling Calculation Mode
              </span>
              <span className={styles.settingDesc}>
                Formula used when multi-pixel sample size &gt; 1×1
              </span>
            </div>
            <select
              className={styles.selectInput}
              value={settings.sampleMode || "average"}
              onChange={(e) => handleChange("sampleMode", e.target.value)}
            >
              {SAMPLE_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>After Pick Action</span>
              <span className={styles.settingDesc}>
                Behavior immediately after clicking to pick a color
              </span>
            </div>
            <select
              className={styles.selectInput}
              value={settings.afterPick || "exit"}
              onChange={(e) => handleChange("afterPick", e.target.value)}
            >
              {AFTER_PICK_ACTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clipboard & Storage */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Clipboard & History</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>
                Automatically Copy Picked Color
              </span>
              <span className={styles.settingDesc}>
                Copies color value to system clipboard upon click
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.autoCopy !== false}
                onChange={() => handleToggle("autoCopy")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Default Copy Format</span>
              <span className={styles.settingDesc}>
                Color notation used for automatic copying
              </span>
            </div>
            <select
              className={styles.selectInput}
              value={settings.copyFormat || "hex-upper"}
              onChange={(e) => handleChange("copyFormat", e.target.value)}
            >
              {COPY_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>
                Save Picked Colors to History
              </span>
              <span className={styles.settingDesc}>
                Stores sampled colors locally in Chrome storage
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.saveHistory !== false}
                onChange={() => handleToggle("saveHistory")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>History Size Limit</span>
              <span className={styles.settingDesc}>
                Maximum number of recent colors saved locally
              </span>
            </div>
            <select
              className={styles.selectInput}
              value={settings.historyLimit || 50}
              onChange={(e) =>
                handleChange("historyLimit", parseInt(e.target.value, 10))
              }
            >
              {HISTORY_LIMITS.map((l) => (
                <option key={l} value={l}>
                  {l} colors
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Keyboard Shortcuts</h2>

          <div
            style={{
              fontSize: "13px",
              color: "#475569",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Start Eyedropper:</span>
              <strong style={{ fontFamily: "monospace" }}>
                Alt + P (configurable in Chrome shortcuts)
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pick Color:</span>
              <strong style={{ fontFamily: "monospace" }}>
                Click / Space / Enter
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Exit Eyedropper:</span>
              <strong style={{ fontFamily: "monospace" }}>Esc</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Refresh Screenshot:</span>
              <strong style={{ fontFamily: "monospace" }}>R</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Toggle Magnifier:</span>
              <strong style={{ fontFamily: "monospace" }}>Shift</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Precision Nudge:</span>
              <strong style={{ fontFamily: "monospace" }}>
                Arrow Keys (Shift + Arrow for 10px)
              </strong>
            </div>
          </div>
        </div>

        <div className={styles.actionsBar}>
          <button className={styles.btnReset} onClick={handleReset}>
            <RotateCcw size={14} />
            Reset all settings to defaults
          </button>
        </div>
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
