import React, { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Plus, Trash2, CopyPlus } from "lucide-react";
import styles from "./GradientApp.module.css";
import { PRESET_GRADIENTS } from "./presets.js";
import { serializeGradientCss } from "./gradientSerializer.js";
import { clamp } from "../color/colorMath.js";
import { parseCssColor } from "../color/colorParser.js";
import { copyToClipboard } from "../shared/clipboard.js";

export function GradientApp() {
  const [gradient, setGradient] = useState({
    type: "linear",
    angle: 135,
    radialShape: "circle",
    radialPosition: "center",
    stops: [
      { id: "1", color: "#3B82F6", opacity: 1, position: 0 },
      { id: "2", color: "#8B5CF6", opacity: 1, position: 50 },
      { id: "3", color: "#EC4899", opacity: 1, position: 100 },
    ],
  });

  const [selectedStopId, setSelectedStopId] = useState("1");
  const [toast, setToast] = useState("");

  const stopTrackRef = useRef(null);
  const isDraggingStop = useRef(false);

  const selectedStop =
    gradient.stops.find((s) => s.id === selectedStopId) || gradient.stops[0];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // Dragging stop handler
  const handleStopMove = useCallback(
    (clientX) => {
      if (!stopTrackRef.current || !selectedStopId) return;
      const rect = stopTrackRef.current.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const position = Math.round((x / rect.width) * 100);

      setGradient((prev) => ({
        ...prev,
        stops: prev.stops.map((s) =>
          s.id === selectedStopId ? { ...s, position } : s,
        ),
      }));
    },
    [selectedStopId],
  );

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingStop.current) handleStopMove(e.clientX);
    };
    const onMouseUp = () => {
      isDraggingStop.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleStopMove]);

  // Click on track to add new stop
  const handleTrackClick = (e) => {
    if (!stopTrackRef.current) return;
    const rect = stopTrackRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const position = Math.round((x / rect.width) * 100);

    const newId = `${Date.now()}`;
    const newStop = {
      id: newId,
      color: selectedStop ? selectedStop.color : "#3B82F6",
      opacity: 1,
      position,
    };

    setGradient((prev) => ({
      ...prev,
      stops: [...prev.stops, newStop].sort((a, b) => a.position - b.position),
    }));
    setSelectedStopId(newId);
  };

  const handleUpdateSelectedStop = (updates) => {
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.map((s) =>
        s.id === selectedStopId ? { ...s, ...updates } : s,
      ),
    }));
  };

  const handleDeleteStop = () => {
    if (gradient.stops.length <= 2) {
      showToast("Gradient requires at least 2 color stops.");
      return;
    }
    const filtered = gradient.stops.filter((s) => s.id !== selectedStopId);
    setGradient((prev) => ({ ...prev, stops: filtered }));
    setSelectedStopId(filtered[0].id);
  };

  const handleDuplicateStop = () => {
    if (!selectedStop) return;
    const newId = `${Date.now()}`;
    const newStop = {
      ...selectedStop,
      id: newId,
      position: Math.min(100, selectedStop.position + 10),
    };
    setGradient((prev) => ({
      ...prev,
      stops: [...prev.stops, newStop].sort((a, b) => a.position - b.position),
    }));
    setSelectedStopId(newId);
  };

  const cssCode = serializeGradientCss(gradient);

  const handleCopyCss = async () => {
    await copyToClipboard(cssCode);
    showToast("CSS copied to clipboard!");
  };

  // Stop track gradient preview
  const trackGradientCss = serializeGradientCss({
    type: "linear",
    angle: 90,
    stops: gradient.stops,
  });

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
          <h1 className={styles.title}>CSS Gradient Generator</h1>
          <p className={styles.subtitle}>
            Modern pure CSS gradients, visual color stops, and real-time export
          </p>
        </div>

        <div className={styles.layout}>
          {/* Left Column: Visual Editor & Preview */}
          <div className={styles.previewCard}>
            {/* Live Gradient Preview */}
            <div className={styles.previewBox}>
              <div className={styles.checkerBg} />
              <div
                className={styles.gradientFill}
                style={{
                  background: cssCode
                    .replace(/^background:\s*/, "")
                    .replace(/;$/, ""),
                }}
              />
            </div>

            {/* Stop Track Bar */}
            <div className={styles.stopBarContainer}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className={styles.stopBarLabel}>
                  Color Stops (Click to add)
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  {gradient.stops.length} stops
                </span>
              </div>

              <div
                ref={stopTrackRef}
                className={styles.stopBarTrack}
                style={{
                  background: trackGradientCss
                    .replace(/^background:\s*/, "")
                    .replace(/;$/, ""),
                }}
                onClick={handleTrackClick}
              >
                {gradient.stops.map((stop) => (
                  <div
                    key={stop.id}
                    className={`${styles.stopHandle} ${selectedStopId === stop.id ? styles.selected : ""}`}
                    style={{
                      left: `${stop.position}%`,
                      backgroundColor: stop.color,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedStopId(stop.id);
                      isDraggingStop.current = true;
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Selected Stop Details */}
            {selectedStop && (
              <div className={styles.stopEditor}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Color:
                  </label>
                  <input
                    type="color"
                    value={selectedStop.color}
                    onChange={(e) =>
                      handleUpdateSelectedStop({ color: e.target.value })
                    }
                    style={{
                      width: "36px",
                      height: "32px",
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={selectedStop.color}
                    onChange={(e) =>
                      handleUpdateSelectedStop({ color: e.target.value })
                    }
                    style={{ width: "85px", fontFamily: "monospace" }}
                  />
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Position:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedStop.position}
                    onChange={(e) =>
                      handleUpdateSelectedStop({
                        position: clamp(
                          parseInt(e.target.value, 10) || 0,
                          0,
                          100,
                        ),
                      })
                    }
                    style={{ width: "60px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>%</span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Opacity:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(
                      (selectedStop.opacity !== undefined
                        ? selectedStop.opacity
                        : 1) * 100,
                    )}
                    onChange={(e) => {
                      const pct = clamp(
                        parseInt(e.target.value, 10) || 0,
                        0,
                        100,
                      );
                      handleUpdateSelectedStop({ opacity: pct / 100 });
                    }}
                    style={{ width: "60px" }}
                  />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>%</span>
                </div>

                <div
                  style={{ display: "flex", gap: "6px", marginLeft: "auto" }}
                >
                  <button
                    className={styles.btnSecondary}
                    onClick={handleDuplicateStop}
                    title="Duplicate stop"
                  >
                    <CopyPlus size={14} />
                  </button>
                  <button
                    className={styles.btnSecondary}
                    onClick={handleDeleteStop}
                    title="Delete stop"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Generated CSS Block */}
            <div className={styles.codeBlock}>
              <code>{cssCode}</code>
            </div>

            <button className={styles.btnPrimary} onClick={handleCopyCss}>
              <Copy size={15} /> Copy CSS Code
            </button>
          </div>

          {/* Right Column: Controls & Presets */}
          <div className={styles.sidebarCard}>
            {/* Gradient Type */}
            <div>
              <h3 className={styles.sectionTitle}>Type</h3>
              <div
                className={styles.typeButtonGroup}
                style={{ marginTop: "10px" }}
              >
                <button
                  className={`${styles.typeBtn} ${gradient.type === "linear" ? styles.active : ""}`}
                  onClick={() =>
                    setGradient((prev) => ({ ...prev, type: "linear" }))
                  }
                >
                  Linear
                </button>
                <button
                  className={`${styles.typeBtn} ${gradient.type === "radial" ? styles.active : ""}`}
                  onClick={() =>
                    setGradient((prev) => ({ ...prev, type: "radial" }))
                  }
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Angle Control for Linear */}
            {gradient.type === "linear" && (
              <div>
                <h3 className={styles.sectionTitle}>Angle</h3>
                <div
                  className={styles.angleControl}
                  style={{ marginTop: "10px" }}
                >
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradient.angle}
                    onChange={(e) =>
                      setGradient((prev) => ({
                        ...prev,
                        angle: parseInt(e.target.value, 10),
                      }))
                    }
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={gradient.angle}
                    onChange={(e) =>
                      setGradient((prev) => ({
                        ...prev,
                        angle: clamp(parseInt(e.target.value, 10) || 0, 0, 360),
                      }))
                    }
                    style={{ width: "65px", textAlign: "center" }}
                  />
                  <span style={{ fontSize: "13px", color: "#64748b" }}>°</span>
                </div>

                {/* Quick Angle Presets */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "6px",
                    marginTop: "10px",
                  }}
                >
                  {[0, 90, 135, 180, 225, 270, 315, 45].map((deg) => (
                    <button
                      key={deg}
                      style={{
                        padding: "4px",
                        fontSize: "11px",
                        background: "#f1f5f9",
                        borderRadius: "4px",
                      }}
                      onClick={() =>
                        setGradient((prev) => ({ ...prev, angle: deg }))
                      }
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Radial Controls */}
            {gradient.type === "radial" && (
              <div>
                <h3 className={styles.sectionTitle}>Shape & Position</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "10px",
                  }}
                >
                  <select
                    value={gradient.radialShape}
                    onChange={(e) =>
                      setGradient((prev) => ({
                        ...prev,
                        radialShape: e.target.value,
                      }))
                    }
                  >
                    <option value="circle">Circle</option>
                    <option value="ellipse">Ellipse</option>
                  </select>

                  <select
                    value={gradient.radialPosition}
                    onChange={(e) =>
                      setGradient((prev) => ({
                        ...prev,
                        radialPosition: e.target.value,
                      }))
                    }
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top left">Top Left</option>
                    <option value="top right">Top Right</option>
                  </select>
                </div>
              </div>
            )}

            {/* Presets Grid */}
            <div>
              <h3 className={styles.sectionTitle}>Presets</h3>
              <div className={styles.presetsGrid} style={{ marginTop: "10px" }}>
                {PRESET_GRADIENTS.map((p) => {
                  const css = serializeGradientCss(p)
                    .replace(/^background:\s*/, "")
                    .replace(/;$/, "");
                  return (
                    <div
                      key={p.name}
                      className={styles.presetCard}
                      style={{ background: css }}
                      onClick={() => {
                        setGradient(p);
                        setSelectedStopId(p.stops[0].id);
                      }}
                    >
                      <span className={styles.presetName}>{p.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
