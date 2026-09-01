import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Copy,
  Highlighter,
  ExternalLink,
  Search,
} from "lucide-react";
import styles from "./AnalyzerApp.module.css";
import { formatColor } from "../color/colorFormatter.js";
import { copyToClipboard } from "../shared/clipboard.js";

export function AnalyzerApp() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabInfo, setTabInfo] = useState({ domain: "", title: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const getTargetTab = async () => {
    if (typeof chrome === "undefined" || !chrome.tabs) return null;

    const urlParams = new URLSearchParams(window.location.search);
    const targetTabIdStr = urlParams.get("tabId");
    let tab = null;

    if (targetTabIdStr) {
      const targetTabId = parseInt(targetTabIdStr, 10);
      if (!isNaN(targetTabId)) {
        try {
          tab = await chrome.tabs.get(targetTabId);
        } catch (e) {
          console.warn("Could not get tab by targetTabId:", e);
        }
      }
    }

    if (!tab) {
      const allTabs = await chrome.tabs.query({ currentWindow: true });
      tab = allTabs.find(
        (t) =>
          t.url &&
          !t.url.startsWith("chrome-extension://") &&
          !t.url.startsWith("chrome://"),
      );
    }

    return tab;
  };

  const scanTab = async () => {
    setLoading(true);
    try {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.scripting) {
        const tab = await getTargetTab();

        if (!tab || !tab.id) {
          showToast(
            "No active webpage found to scan. Please open a website in another tab.",
          );
          setLoading(false);
          return;
        }

        setTabInfo({
          domain: tab.url ? new URL(tab.url).hostname : "Active Tab",
          title: tab.title || "",
        });

        // 1. Inject scanner bundle into page
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["src/analyzer/scanPageColors.bundle.js"],
        });

        // 2. Execute scanner
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            if (typeof window.__scanPageColors === "function") {
              return window.__scanPageColors();
            }
            return [];
          },
        });

        if (results && results[0] && Array.isArray(results[0].result)) {
          setColors(results[0].result);
          showToast(`Found ${results[0].result.length} unique colors!`);
        } else {
          setColors([]);
          showToast("No colors extracted.");
        }
      } else {
        // Mock data for preview in standalone dev mode
        setTabInfo({ domain: "example.com", title: "Example Page" });
        setColors([
          {
            hex: "#3B82F6",
            totalUses: 45,
            textUses: 12,
            backgroundUses: 28,
            borderUses: 5,
            svgUses: 0,
            color: { r: 59, g: 130, b: 246, hex: "#3B82F6" },
          },
          {
            hex: "#0F172A",
            totalUses: 120,
            textUses: 110,
            backgroundUses: 10,
            borderUses: 0,
            svgUses: 0,
            color: { r: 15, g: 23, b: 42, hex: "#0F172A" },
          },
          {
            hex: "#FFFFFF",
            totalUses: 80,
            textUses: 20,
            backgroundUses: 60,
            borderUses: 0,
            svgUses: 0,
            color: { r: 255, g: 255, b: 255, hex: "#FFFFFF" },
          },
          {
            hex: "#EF4444",
            totalUses: 8,
            textUses: 4,
            backgroundUses: 2,
            borderUses: 2,
            svgUses: 0,
            color: { r: 239, g: 68, b: 68, hex: "#EF4444" },
          },
          {
            hex: "#10B981",
            totalUses: 15,
            textUses: 5,
            backgroundUses: 6,
            borderUses: 2,
            svgUses: 2,
            color: { r: 16, g: 185, b: 129, hex: "#10B981" },
          },
        ]);
      }
    } catch (err) {
      console.error("Scanning active tab failed:", err);
      showToast("Could not scan active tab. Is it a protected Chrome page?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanTab();
  }, []);

  const handleCopy = async (color, format = "hex-upper") => {
    const text = formatColor(color, format);
    await copyToClipboard(text);
    showToast(`Copied ${text}`);
  };

  const handleHighlight = async (hex) => {
    try {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.scripting) {
        const tab = await getTargetTab();

        if (tab && tab.id) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/analyzer/highlightColor.bundle.js"],
          });

          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (targetHex) => {
              if (typeof window.__highlightColorOnPage === "function") {
                return window.__highlightColorOnPage(targetHex);
              }
              return 0;
            },
            args: [hex],
          });

          const count = results && results[0] ? results[0].result : 0;
          showToast(`Highlighted ${count} elements on page!`);
        }
      } else {
        showToast(`Highlighted elements with ${hex} (simulated)`);
      }
    } catch (e) {
      console.warn("Highlight failed:", e);
    }
  };

  const filteredColors = colors.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const hex = item.hex.toLowerCase();
      const rgb = formatColor(item.color, "rgb").toLowerCase();
      if (!hex.includes(q) && !rgb.includes(q)) return false;
    }

    if (activeFilter === "text") return item.textUses > 0;
    if (activeFilter === "background") return item.backgroundUses > 0;
    if (activeFilter === "border") return item.borderUses > 0;
    if (activeFilter === "svg") return item.svgUses > 0;

    return true;
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
          <div>
            <h1 className={styles.title}>Webpage Color Analyzer</h1>
            <p className={styles.subtitle}>
              {tabInfo.domain
                ? `Analyzed colors for: ${tabInfo.domain}`
                : "Scan page colors"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Filter HEX / RGB…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "180px" }}
            />
            <button
              className={styles.btnPrimary}
              onClick={scanTab}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              {loading ? "Scanning…" : "Re-scan Page"}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          {[
            { id: "all", label: `All (${colors.length})` },
            { id: "text", label: "Text Colors" },
            { id: "background", label: "Backgrounds" },
            { id: "border", label: "Borders" },
            { id: "svg", label: "SVG Fill & Stroke" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeFilter === tab.id ? styles.active : ""}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredColors.length === 0 ? (
          <div className={styles.emptyState}>
            <Search
              size={36}
              style={{ color: "#94a3b8", marginBottom: "12px" }}
            />
            <h3>No colors detected</h3>
            <p style={{ marginTop: "6px", fontSize: "13px" }}>
              Click "Re-scan Page" while an active webpage is open in another
              tab.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredColors.map((item) => (
              <div key={item.hex} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: item.hex }}
                  />
                  <div className={styles.cardInfo}>
                    <span className={styles.hexVal}>{item.hex}</span>
                    <span className={styles.rgbVal}>
                      {formatColor(item.color, "rgb")}
                    </span>
                  </div>
                  <span className={styles.totalBadge}>
                    {item.totalUses} uses
                  </span>
                </div>

                <div className={styles.breakdownRow}>
                  {item.textUses > 0 && (
                    <span className={styles.breakdownBadge}>
                      Text: {item.textUses}
                    </span>
                  )}
                  {item.backgroundUses > 0 && (
                    <span className={styles.breakdownBadge}>
                      BG: {item.backgroundUses}
                    </span>
                  )}
                  {item.borderUses > 0 && (
                    <span className={styles.breakdownBadge}>
                      Border: {item.borderUses}
                    </span>
                  )}
                  {item.svgUses > 0 && (
                    <span className={styles.breakdownBadge}>
                      SVG: {item.svgUses}
                    </span>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.btnAction}
                    onClick={() => handleHighlight(item.hex)}
                  >
                    <Highlighter size={13} />
                    Highlight
                  </button>
                  <button
                    className={styles.btnAction}
                    onClick={() => handleCopy(item.color, "hex-upper")}
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
