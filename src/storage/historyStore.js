import { STORAGE_KEYS } from "../shared/constants.js";
import { getSettings } from "./settingsStore.js";
import { formatColor } from "../color/colorFormatter.js";

/**
 * Manages picked colors history in chrome.storage.local.
 */
export async function getHistory() {
  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const data = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
      if (data && Array.isArray(data[STORAGE_KEYS.HISTORY])) {
        return data[STORAGE_KEYS.HISTORY];
      }
    } else if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error("Error reading history:", err);
  }
  return [];
}

export async function addColorToHistory(colorModel, sourceInfo = {}) {
  if (!colorModel) return null;

  const settings = await getSettings();
  if (!settings.saveHistory) return null;

  const history = await getHistory();

  const newItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    color: colorModel,
    pickedAt: new Date().toISOString(),
    sourceDomain: sourceInfo.domain || "manual",
    sourceType: sourceInfo.type || "page", // 'page' | 'system' | 'manual' | 'palette' | 'analyzer'
    favorite: false,
  };

  // Add new item to front
  const updated = [newItem, ...history];

  // Trim to limit (respecting favorites where possible)
  const limit = settings.historyLimit || 50;
  let finalHistory = updated;
  if (updated.length > limit) {
    const favorites = updated.filter((item) => item.favorite);
    const nonFavorites = updated.filter((item) => !item.favorite);
    const allowedNonFavorites = Math.max(0, limit - favorites.length);
    finalHistory = [
      ...favorites,
      ...nonFavorites.slice(0, allowedNonFavorites),
    ];
    // Sort by date desc
    finalHistory.sort(
      (a, b) => new Date(b.pickedAt).getTime() - new Date(a.pickedAt).getTime(),
    );
  }

  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: finalHistory });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(finalHistory));
    }
  } catch (err) {
    console.error("Error saving color to history:", err);
  }

  return newItem;
}

export async function removeHistoryItem(id) {
  const history = await getHistory();
  const filtered = history.filter((item) => item.id !== id);

  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: filtered });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error("Error removing history item:", err);
  }

  return filtered;
}

export async function clearHistory() {
  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [] });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    }
  } catch (err) {
    console.error("Error clearing history:", err);
  }
  return [];
}

export async function toggleFavorite(id) {
  const history = await getHistory();
  const updated = history.map((item) => {
    if (item.id === id) {
      return { ...item, favorite: !item.favorite };
    }
    return item;
  });

  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: updated });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error("Error toggling favorite:", err);
  }

  return updated;
}

/**
 * Exports history in requested format.
 */
export function exportHistoryData(historyItems, format = "json") {
  if (!historyItems || historyItems.length === 0) return "";

  switch (format) {
    case "json":
      return JSON.stringify(historyItems, null, 2);

    case "csv": {
      const header = "ID,HEX,RGB,HSL,Domain,Type,Favorite,PickedAt\n";
      const rows = historyItems
        .map((item) => {
          const hex = item.color?.hex || "";
          const rgb = formatColor(item.color, "rgb");
          const hsl = formatColor(item.color, "hsl");
          const domain = item.sourceDomain || "";
          const type = item.sourceType || "";
          const fav = item.favorite ? "true" : "false";
          const date = item.pickedAt || "";
          return `"${item.id}","${hex}","${rgb}","${hsl}","${domain}","${type}","${fav}","${date}"`;
        })
        .join("\n");
      return header + rows;
    }

    case "css": {
      const vars = historyItems
        .map((item, idx) => {
          const hex = item.color?.hex || "#000000";
          return `  --color-picked-${idx + 1}: ${hex}; /* ${item.sourceDomain} */`;
        })
        .join("\n");
      return `:root {\n${vars}\n}`;
    }

    default:
      return JSON.stringify(historyItems, null, 2);
  }
}
