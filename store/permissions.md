# Chrome Extension Permissions Explanation

Pixel Color adheres strictly to the principle of least privilege. The extension declares only the minimum set of permissions required to deliver its core functionality:

### 1. `activeTab`

- **Purpose**: Grants temporary access to the currently active tab only when the user explicitly triggers an action (such as clicking "Pick Color From Page" or "Webpage Color Analyzer" in the popup menu or pressing the shortcut key).
- **Usage**: Used to capture the visible viewport for raster pixel sampling and to inspect computed styles on the active page.
- **Privacy Assurance**: Access is strictly limited to the active tab during active interaction and does not grant broad `<all_urls>` background browsing access.

### 2. `scripting`

- **Purpose**: Allows the extension to inject the local eyedropper overlay, magnifier, and temporary element highlight outlines into the webpage DOM.
- **Usage**: Executes the isolated Shadow DOM overlay (`#pixel-color-root`) and DOM analyzer scripts in response to user requests.

### 3. `storage`

- **Purpose**: Enables local persistent storage via `chrome.storage.local`.
- **Usage**: Stores user configuration options (such as default sample size and clipboard copy formats) and picked color history on the user's machine.
- **Privacy Assurance**: No data stored locally is ever synchronized with external servers or cloud services.
