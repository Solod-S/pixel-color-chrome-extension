import { PickerOverlay } from './pickerOverlay.js';
import { cleanupExistingPicker } from './cleanupPicker.js';

/**
 * Injected entry point for the webpage picker.
 */
export async function initPicker(dataUrl, settings) {
  // Clean up any previously active instance
  cleanupExistingPicker();

  if (!dataUrl) {
    console.error('Pixel Color: No screenshot data provided to picker.');
    return;
  }

  try {
    const picker = new PickerOverlay(dataUrl, settings);
    window.__pixelColorPickerInstance = picker;
    await picker.start();
  } catch (err) {
    console.error('Pixel Color: Failed to initialize picker overlay:', err);
    cleanupExistingPicker();
  }
}

// Expose globally for chrome.scripting.executeScript
window.__initPixelColorPicker = initPicker;

// Support listener for message from service worker
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'START_INJECTED_PICKER') {
      initPicker(message.dataUrl, message.settings);
      sendResponse({ status: 'ok' });
    }
  });
}
