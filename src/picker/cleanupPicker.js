/**
 * Global cleanup helper for Pixel Color overlay.
 */
export function cleanupExistingPicker() {
  if (window.__pixelColorPickerInstance) {
    try {
      window.__pixelColorPickerInstance.cleanup();
    } catch (e) {
      console.error("Error cleaning up existing picker instance:", e);
    }
    window.__pixelColorPickerInstance = null;
  }

  const existingRoot = document.getElementById("pixel-color-root");
  if (existingRoot && existingRoot.parentNode) {
    existingRoot.parentNode.removeChild(existingRoot);
  }
}
