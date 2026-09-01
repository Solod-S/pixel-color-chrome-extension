import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../shared/constants.js";

/**
 * Manages Pixel Color settings with chrome.storage.local (and localStorage fallback).
 */
export async function getSettings() {
  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
      if (data && data[STORAGE_KEYS.SETTINGS]) {
        return { ...DEFAULT_SETTINGS, ...data[STORAGE_KEYS.SETTINGS] };
      }
    } else if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    }
  } catch (err) {
    console.error("Error loading settings:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(newSettings) {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };

  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: merged });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    }
  } catch (err) {
    console.error("Error saving settings:", err);
  }

  return merged;
}

export async function resetSettings() {
  try {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS),
      );
    }
  } catch (err) {
    console.error("Error resetting settings:", err);
  }
  return { ...DEFAULT_SETTINGS };
}
