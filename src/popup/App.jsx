import React, { useState, useEffect } from 'react';
import {
  Pipette,
  Sliders,
  History,
  Search,
  Palette,
  Layers,
  Settings
} from 'lucide-react';
import styles from './App.module.css';
import { MESSAGE_TYPES, TOOL_PAGES } from '../shared/messages.js';
import { getHistory } from '../storage/historyStore.js';
import { copyToClipboard } from '../shared/clipboard.js';

export function App() {
  const [recentColors, setRecentColors] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    getHistory().then((items) => {
      if (items && items.length > 0) {
        setRecentColors(items.slice(0, 7));
      }
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 1500);
  };

  const handleStartPicker = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.START_PICKER,
            tabId: tab.id
          });
        }
      }
      window.close();
    } catch (e) {
      console.error('Failed to start picker:', e);
      window.close();
    }
  };

  const handleOpenPage = async (pageName) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const targetTabId = tab ? tab.id : '';
        const url = chrome.runtime.getURL(`${pageName}?tabId=${targetTabId}`);
        chrome.tabs.create({ url });
        window.close();
      } else {
        window.open(pageName, '_blank');
      }
    } catch (e) {
      console.error('Failed to open tool page:', e);
    }
  };

  const handleCopyColor = async (hex) => {
    await copyToClipboard(hex);
    showToast(`Copied ${hex}`);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <img src="/icons/icon32.png" alt="Logo" className={styles.logoIcon} />
          <span>Pixel Color</span>
        </div>
        <span className={styles.version}>v1.0.0</span>
      </div>

      <div className={styles.section}>
        <button
          className={`${styles.menuItem} ${styles.primary}`}
          onClick={handleStartPicker}
        >
          <span className={styles.itemIcon}><Pipette size={16} /></span>
          <span>Pick Color From Page</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => handleOpenPage(TOOL_PAGES.COLOR_PICKER)}
        >
          <span className={styles.itemIcon}><Sliders size={16} /></span>
          <span>Color Picker</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => handleOpenPage(TOOL_PAGES.HISTORY)}
        >
          <span className={styles.itemIcon}><History size={16} /></span>
          <span>Picked Color History</span>
        </button>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.section}>
        <button
          className={styles.menuItem}
          onClick={() => handleOpenPage(TOOL_PAGES.ANALYZER)}
        >
          <span className={styles.itemIcon}><Search size={16} /></span>
          <span>Webpage Color Analyzer</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => handleOpenPage(TOOL_PAGES.PALETTES)}
        >
          <span className={styles.itemIcon}><Palette size={16} /></span>
          <span>Palette Browser</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => handleOpenPage(TOOL_PAGES.GRADIENT)}
        >
          <span className={styles.itemIcon}><Layers size={16} /></span>
          <span>CSS Gradient Generator</span>
        </button>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.section}>
        <button
          className={styles.menuItem}
          onClick={() => handleOpenPage(TOOL_PAGES.OPTIONS)}
        >
          <span className={styles.itemIcon}><Settings size={16} /></span>
          <span>Options</span>
        </button>
      </div>

      {recentColors.length > 0 && (
        <div className={styles.recentSection}>
          <div className={styles.recentTitle}>Recent Picked</div>
          <div className={styles.recentGrid}>
            {recentColors.map((item) => (
              <div
                key={item.id}
                className={styles.recentSwatch}
                style={{ backgroundColor: item.color.hex }}
                title={`Click to copy: ${item.color.hex}`}
                onClick={() => handleCopyColor(item.color.hex)}
              />
            ))}
          </div>
        </div>
      )}

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}
