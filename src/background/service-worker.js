import { MESSAGE_TYPES } from '../shared/messages.js';
import { getSettings } from '../storage/settingsStore.js';
import { addColorToHistory } from '../storage/historyStore.js';

function isProtectedUrl(url) {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('view-source:') ||
    url.startsWith('about:') ||
    url.startsWith('edge://') ||
    url.includes('chrome.google.com/webstore') ||
    url.includes('chromewebstore.google.com')
  );
}

// Start picker on the target tab
async function startPickerOnActiveTab(targetTabId) {
  try {
    let tab;
    if (targetTabId) {
      try {
        tab = await chrome.tabs.get(targetTabId);
      } catch (e) {
        console.warn('Could not get tab by targetTabId:', e);
      }
    }

    if (!tab) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      tab = activeTab;
    }

    if (!tab || !tab.id) {
      console.warn('No active tab found.');
      return { success: false, error: 'No active tab' };
    }

    if (isProtectedUrl(tab.url)) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            alert('Pixel Color cannot inspect protected Chrome pages or Chrome Web Store.');
          }
        });
      } catch (e) {
        console.warn('Cannot show alert on protected page:', e);
      }
      return { success: false, error: 'Protected page' };
    }

    // Capture visible viewport screenshot
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const settings = await getSettings();

    // Inject self-contained picker bundle into tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/picker/picker.bundle.js']
    });

    // Initialize picker
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (data, opts) => {
        if (typeof window.__initPixelColorPicker === 'function') {
          window.__initPixelColorPicker(data, opts);
        }
      },
      args: [dataUrl, settings]
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to start picker on tab:', err);
    return { success: false, error: err.message };
  }
}

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'start-picker') {
    startPickerOnActiveTab();
  }
});

// Handle incoming messages from popup, tools, and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  switch (message.type) {
    case MESSAGE_TYPES.START_PICKER: {
      const tabId = message.tabId || (sender.tab ? sender.tab.id : undefined);
      startPickerOnActiveTab(tabId).then(sendResponse);
      return true; // Async response
    }

    case MESSAGE_TYPES.REQUEST_SCREENSHOT: {
      const windowId = sender.tab ? sender.tab.windowId : undefined;
      chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
        .then((dataUrl) => {
          sendResponse({ dataUrl });
        })
        .catch((err) => {
          console.error('Recapture failed in background:', err);
          sendResponse({ dataUrl: null, error: err.message });
        });
      return true;
    }

    case MESSAGE_TYPES.COLOR_PICKED: {
      if (message.payload && message.payload.color) {
        addColorToHistory(message.payload.color, {
          domain: message.payload.sourceDomain,
          type: message.payload.sourceType || 'page'
        }).then((saved) => {
          sendResponse({ success: true, saved });
        });
        return true;
      }
      break;
    }

    case MESSAGE_TYPES.OPEN_PAGE: {
      if (message.payload && message.payload.page) {
        const url = chrome.runtime.getURL(message.payload.page);
        chrome.tabs.create({ url });
        sendResponse({ success: true });
      }
      break;
    }

    default:
      break;
  }
});
