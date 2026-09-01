# Privacy Policy for Pixel Color

**Last updated:** August 31, 2026

**Pixel Color** ("the Extension") is dedicated to protecting user privacy. The extension is built following a strict local-first and zero-telemetry architecture.

### 1. Data Collection & Processing

- **Local Processing**: Pixel Color operates entirely inside the user's browser.
- **No External Servers**: The extension does not maintain, connect to, or transmit any data to remote servers or backend databases.
- **No Analytics / Telemetry**: Pixel Color contains zero analytics libraries, tracking pixels, or diagnostic telemetry.

### 2. Screenshot & Viewport Sampling

- To enable accurate color sampling from visual content (such as images, CSS gradients, canvas elements, and videos), Pixel Color captures a temporary raster screenshot of the visible viewport using the standard `chrome.tabs.captureVisibleTab` Chrome API.
- This screenshot is retained strictly in volatile browser memory for the duration of the eyedropper sampling session.
- Screenshots are **never saved to persistent storage**, never written to disk, and **never transmitted over the network**.
- Upon closing or exiting the eyedropper, all memory references and canvas buffers are immediately discarded.

### 3. Storage

- The extension utilizes `chrome.storage.local` solely to store:
  - User preferences and settings (e.g., default sample size, copy format, magnifier toggle).
  - Picked color history (HEX/RGB values, color category, source domain, timestamp, and favorite markers).
- History records store only the hostname domain (e.g., `example.com`), not full URLs, query parameters, or browsing activity.
- Storage data remains entirely on the user's local machine and can be cleared at any time via the extension's History or Options pages.

### 4. Third-Party Scripts

- Pixel Color uses no third-party CDNs, external web fonts, or remote scripts. All code and assets are self-contained within the extension bundle.

### 5. Contact

For questions or issues regarding privacy, please review the open-source repository documentation.
