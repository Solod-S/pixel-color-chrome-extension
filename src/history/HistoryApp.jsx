import React, { useState, useEffect } from "react";
import {
  Copy,
  Trash2,
  Star,
  Download,
  Search,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import styles from "./HistoryApp.module.css";
import {
  getHistory,
  removeHistoryItem,
  clearHistory,
  toggleFavorite,
  exportHistoryData,
} from "../storage/historyStore.js";
import { formatColor } from "../color/colorFormatter.js";
import { copyToClipboard } from "../shared/clipboard.js";

export function HistoryApp() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [toast, setToast] = useState("");

  const loadData = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleCopy = async (color, format = "hex-upper") => {
    const text = formatColor(color, format);
    await copyToClipboard(text);
    showToast(`Copied ${text}`);
  };

  const handleDelete = async (id) => {
    const updated = await removeHistoryItem(id);
    setHistory(updated);
    showToast("Item deleted");
  };

  const handleToggleFavorite = async (id) => {
    const updated = await toggleFavorite(id);
    setHistory(updated);
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire color history?",
      )
    ) {
      await clearHistory();
      setHistory([]);
      showToast("History cleared");
    }
  };

  const handleExport = (format) => {
    const data = exportHistoryData(history, format);
    const mime = format === "json" ? "application/json" : "text/plain";
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pixel-color-history.${format === "css" ? "css" : format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${format.toUpperCase()}`);
  };

  const filteredHistory = history.filter((item) => {
    if (favoritesOnly && !item.favorite) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const hex = item.color?.hex?.toLowerCase() || "";
    const rgb = formatColor(item.color, "rgb").toLowerCase();
    const domain = item.sourceDomain?.toLowerCase() || "";
    return hex.includes(q) || rgb.includes(q) || domain.includes(q);
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
            <h1 className={styles.title}>Picked Color History</h1>
            <p className={styles.subtitle}>{history.length} saved colors</p>
          </div>

          <div className={styles.controls}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search HEX, RGB, domain…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className={`${styles.filterBtn} ${favoritesOnly ? styles.active : ""}`}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Star size={14} fill={favoritesOnly ? "currentColor" : "none"} />
              Favorites
            </button>

            {history.length > 0 && (
              <>
                <button
                  className={styles.filterBtn}
                  onClick={() => handleExport("json")}
                  title="Export as JSON"
                >
                  <Download size={14} /> JSON
                </button>
                <button
                  className={styles.filterBtn}
                  onClick={() => handleExport("css")}
                  title="Export as CSS Variables"
                >
                  <Download size={14} /> CSS
                </button>
                <button
                  className={styles.filterBtn}
                  onClick={handleClearAll}
                  title="Clear history"
                >
                  <Trash2 size={14} /> Clear
                </button>
              </>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <RotateCcw size={36} className={styles.emptyIcon} />
            <h3>No colors found</h3>
            <p style={{ marginTop: "6px", fontSize: "13px" }}>
              {history.length === 0
                ? "Colors you sample with the eyedropper or save from tools will appear here."
                : "No colors matched your search or filters."}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredHistory.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.swatch}>
                    <div className={styles.checkerBg} />
                    <div
                      className={styles.swatchFill}
                      style={{
                        backgroundColor: item.color.hex8 || item.color.hex,
                      }}
                    />
                  </div>

                  <div className={styles.cardMeta}>
                    <span className={styles.hexVal}>{item.color.hex}</span>
                    <span className={styles.rgbVal}>
                      {formatColor(item.color, "rgb")}
                    </span>
                    <span className={styles.hslVal}>
                      {formatColor(item.color, "hsl")}
                    </span>
                  </div>

                  <button
                    className={`${styles.iconBtn} ${item.favorite ? styles.favActive : ""}`}
                    onClick={() => handleToggleFavorite(item.id)}
                    title={item.favorite ? "Remove favorite" : "Add favorite"}
                  >
                    <Star
                      size={16}
                      fill={item.favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className={styles.cardFooter}>
                  <span
                    className={styles.domainBadge}
                    title={item.sourceDomain}
                  >
                    {item.sourceDomain}
                  </span>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => handleCopy(item.color, "hex-upper")}
                      title="Copy HEX"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() => handleDelete(item.id)}
                      title="Delete color"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
