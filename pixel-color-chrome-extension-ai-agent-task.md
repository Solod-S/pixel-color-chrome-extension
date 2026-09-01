# Pixel Color — техническое задание для AI Coding Agent

## 0. Роль AI-агента

Ты — senior frontend / Chrome Extension engineer.

Нужно реализовать production-ready Chrome Extension **Pixel Color** — современный набор инструментов для работы с цветами на веб-страницах.

По функциональному направлению продукт похож на ColorZilla, но должен иметь собственные:

- исходный код;
- архитектуру;
- UI;
- branding;
- icons/assets;
- тексты;
- preset palettes;
- gradient presets.

Не копировать чужой source code, CSS, logo, screenshots или интерфейс 1:1.

Главная формулировка:

> **Pixel Color — Color Picker, Eyedropper, Palette & CSS Gradient Tools**

Основной UX:

```text
User opens a webpage
↓
Clicks Pixel Color
↓
Popup menu opens
↓
Chooses a tool
↓
Pixel Color works locally with colors on the current page
```

В первой версии:

```text
No backend
No accounts
No analytics
No telemetry
No AI
No cloud sync
No remote scripts
```

Не отправлять наружу:

```text
screenshots
picked colors
page URLs
page HTML
CSS
palette data
history
```

---

# 1. Название

Основное:

```text
Pixel Color
```

Chrome Web Store:

```text
Pixel Color — Color Picker & Eyedropper
```

Slug:

```text
pixel-color
```

Short description:

```text
Pick colors from webpages, inspect pixels, analyze palettes and generate modern CSS gradients.
```

---

# 2. Целевая аудитория

```text
frontend developers
web designers
UI/UX designers
graphic designers
QA engineers
WordPress developers
content managers
site owners
```

---

# 3. Основные инструменты

Pixel Color должен содержать:

```text
1. Pick Color From Page
2. Advanced Color Picker
3. Picked Color History
4. Webpage Color Analyzer
5. Palette Browser
6. CSS Gradient Generator
7. Options
```

Дополнительно, если API доступен:

```text
Pick Color Anywhere / Native EyeDropper
```

---

# 4. Popup menu

По клику на icon открыть compact popup:

```text
Pixel Color
────────────────────────

🎯 Pick Color From Page
🎨 Color Picker
🕘 Picked Color History

────────────────────────

🔎 Webpage Color Analyzer
🎨 Palette Browser
▦ CSS Gradient Generator

────────────────────────

⚙ Options
```

Собственный современный light UI.

---

# 5. Стек

Использовать:

```text
Chrome Extension Manifest V3
React 19
Vite 8
JavaScript ES2022+
```

Без TypeScript.

UI:

```text
React
CSS Modules / modular CSS
lucide-react
```

Tests:

```text
Vitest
React Testing Library
```

Опционально:

```text
Playwright
```

Не использовать CDN.

---

# 6. Manifest V3

Использовать:

```json
{
  "manifest_version": 3
}
```

Background:

```text
service worker
```

---

# 7. Permissions

Предпочтительно:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ]
}
```

Для pixel sampling использовать:

```text
chrome.tabs.captureVisibleTab()
```

Не добавлять без необходимости:

```text
<all_urls>
history
cookies
webRequest
downloads
bookmarks
```

Если выбранная реализация требует дополнительного permission, добавить только минимально необходимый и объяснить его в `store/permissions.md`.

---

# 8. Главная техническая функция — Pick Color From Page

Pixel Color должен выбирать реальный цвет rendered pixel, а не просто `background-color`.

Основной P0 pipeline:

```text
User clicks "Pick Color From Page"
↓
Service worker captures current visible tab
↓
chrome.tabs.captureVisibleTab()
↓
Screenshot transferred to injected picker
↓
Picker overlay starts
↓
Mouse moves over webpage
↓
Pointer coordinate mapped to screenshot pixel
↓
Magnifier + HEX/RGB/HSL + element info displayed
↓
User clicks
↓
Color saved to history
↓
Color copied depending settings
↓
Picker exits or continues
```

---

# 9. Почему screenshot sampling обязателен

Не использовать только:

```js
getComputedStyle(element).backgroundColor
```

как color picker.

Визуальный пиксель может быть результатом:

```text
background image
gradient
image
video
canvas
SVG
opacity
blend mode
shadow
anti-aliasing
nested transparency
```

Для реального pixel picker использовать raster screenshot текущего viewport.

Computed styles использовать только как дополнительную информацию об element.

---

# 10. captureVisibleTab

Использовать:

```js
chrome.tabs.captureVisibleTab(...)
```

Screenshot:

- не сохранять в storage;
- не скачивать;
- не отправлять наружу;
- использовать только в памяти;
- освобождать после picker cleanup.

---

# 11. Не загрязнять screenshot overlay-элементами

Первичный sequence:

```text
capture screenshot
↓
mount picker overlay
```

При recapture:

```text
hide Pixel Color overlay
↓
requestAnimationFrame
↓
capture
↓
restore overlay
```

Picker UI не должен попадать в sampled image.

---

# 12. Scroll / Resize

Screenshot становится невалидным после:

```text
scroll
resize
orientation/viewport change
```

Picker должен:

1. слушать `scroll`;
2. слушать `resize`;
3. debounce;
4. запросить новый screenshot;
5. обновить coordinate mapping.

Пока идет обновление:

```text
Refreshing sample…
```

---

# 13. Dynamic content

Видео, canvas, animation могут измениться после capture.

Добавить:

```text
R — Refresh Sample
```

и toolbar action:

```text
Refresh
```

P1:

```text
optional throttled auto refresh
```

Не делать screenshot capture на каждый `mousemove`.

---

# 14. Coordinate mapping

Не предполагать:

```text
CSS pixel == screenshot pixel
```

Использовать:

```js
scaleX = screenshotWidth / window.innerWidth
scaleY = screenshotHeight / window.innerHeight
```

Это должно корректно работать при:

```text
devicePixelRatio
browser zoom
OS scaling
HiDPI
```

Использовать реальные размеры изображения и viewport.

---

# 15. Canvas sampling

Загрузить screenshot через:

```text
ImageBitmap
```

или:

```text
HTMLImageElement
```

Затем hidden/offscreen canvas.

Sampling:

```js
ctx.getImageData(x, y, width, height)
```

Не читать весь imageData на каждый mousemove.

Читать только небольшой участок вокруг pointer.

---

# 16. Размеры выборки

Обязательно:

```text
1×1
3×3
5×5
11×11
25×25
```

Default:

```text
1×1
```

---

# 17. Average Color

Для sample > 1 поддержать:

```text
Average
Center Pixel
```

Default:

```text
Average
```

Average:

```text
avgR = sum(R) / pixelCount
avgG = sum(G) / pixelCount
avgB = sum(B) / pixelCount
```

Корректно обрабатывать края viewport.

---

# 18. Picker toolbar

Показывать compact toolbar на странице:

```text
Pixel Color

Sample: [1×1 ▼]

■ #E7483F
rgb(231, 72, 63)
hsl(3, 76%, 58%)

IMG.logo
640 × 400

[Refresh] [Close]
```

Toolbar не должен менять layout страницы.

---

# 19. Magnifier

Обязательный функционал.

Например:

```text
11×11 source pixels
→
220×220 visual magnifier
```

Magnifier должен:

```text
show pixel grid
show center pixel
show selected region
stay inside viewport
pointer-events: none
```

Использовать:

```js
imageSmoothingEnabled = false
```

---

# 20. Crosshair

При picker active:

```text
cursor: crosshair
```

Options:

```text
☑ Use crosshair cursor
```

Default ON.

---

# 21. Element outline

DOM element под cursor подсветить temporary outline.

Setting:

```text
☑ Outline hovered element
```

Default ON.

Не менять layout.

---

# 22. Element info

Использовать:

```js
document.elementFromPoint(clientX, clientY)
```

Игнорировать собственный overlay.

Показывать:

```text
tagName
id
class
width
height
```

Пример:

```text
IMG.logo
640×400
```

---

# 23. Color formats

Поддержать:

```text
HEX
HEX8
RGB
RGBA
HSL
HSLA
HSV / HSB
```

P1:

```text
HWB
CMYK approximate
```

---

# 24. Pick action

При click:

1. взять текущий sample;
2. сохранить в history;
3. auto-copy согласно settings;
4. показать `Copied`;
5. exit или continue.

Setting:

```text
After pick:
○ Exit picker
○ Continue picking
```

Default:

```text
Exit picker
```

---

# 25. Keyboard

P0:

```text
Esc → Exit
R → Refresh screenshot
Enter / Space → Pick current color
Shift → Temporarily hide/show magnifier
```

P1:

```text
Arrow → move sample by 1 px
Shift+Arrow → 10 px
```

---

# 26. Auto-copy

Options:

```text
☑ Automatically copy picked color
```

Default ON.

Formats:

```text
HEX uppercase
HEX lowercase
RGB
RGBA
HSL
HSLA
HSV
```

Default:

```text
HEX uppercase
```

---

# 27. Advanced Color Picker

Отдельная extension page:

```text
color-picker.html
```

Не размещать advanced editor в маленьком popup.

---

# 28. Advanced Color Picker UI

Нужны:

```text
Saturation/Value square
Hue slider
Alpha control
Current color
New color
HEX
RGB
HSL
HSV
```

Все поля синхронизированы.

Пример:

```text
Current      New
■            ■

HEX    #2D8DA3
R      45
G      141
B      163

H      191
S      57
L      41

HSV    191 / 72 / 64

Alpha  100%

[Copy HEX] [Copy RGB] [Save]
```

---

# 29. Manual color input

Поддержать:

```text
#fff
#ffffff
#ffffffff
rgb(...)
rgba(...)
hsl(...)
hsla(...)
```

Invalid:

```text
Invalid color value
```

---

# 30. Native EyeDropper

Если доступен:

```js
window.EyeDropper
```

добавить:

```text
Pick Color Anywhere
```

Только по explicit user gesture.

Если нет:

```text
System eyedropper is not supported by this browser.
```

P0 можно оставить screenshot picker главным способом, Native EyeDropper — P1.

---

# 31. Picked Color History

Отдельная page:

```text
history.html
```

History item:

```text
swatch
HEX
RGB
HSL
source domain
timestamp
```

Privacy-first:

```text
store domain only
```

не full URL по умолчанию.

---

# 32. History storage

Использовать:

```text
chrome.storage.local
```

Default:

```text
50 colors
```

Options:

```text
25
50
100
250
```

---

# 33. History actions

```text
Copy HEX
Copy RGB
Open in Color Picker
Delete
Clear History
```

P1:

```text
Favorites
Export palette
```

---

# 34. Webpage Color Analyzer

Отдельная page:

```text
analyzer.html
```

Анализировать current active tab.

P0 источники:

```text
computed text color
background-color
border-top/right/bottom/left-color
SVG fill
SVG stroke
```

P1:

```text
shadows
gradients
CSS custom properties
screenshot dominant colors
```

---

# 35. Analyzer aggregation

Группировать normalized colors:

```text
#FFFFFF   628 uses
#111111   342 uses
#F7F7F7   155 uses
#00A046    41 uses
```

Показывать usage categories:

```text
Text
Background
Border
Fill
Stroke
```

---

# 36. Analyzer UI

Tabs/filters:

```text
All
Most Used
Text
Backgrounds
Borders
SVG
```

Search:

```text
Search HEX / RGB
```

Color card:

```text
■ #00A046
rgb(0, 160, 70)

41 uses

Text: 2
Background: 35
Border: 4

[Copy] [Highlight]
```

---

# 37. Analyzer highlight

Кнопка:

```text
Highlight
```

Подсветить elements, использующие выбранный computed color.

Для больших наборов:

```text
max first 300 elements
```

---

# 38. Transparent

Не считать:

```text
transparent
rgba(0,0,0,0)
```

обычным visible color без контекста.

По умолчанию исключать из основной palette.

---

# 39. Palette Browser

Отдельная page:

```text
palettes.html
```

Минимум 7 собственных preset palettes.

Не копировать preset collection ColorZilla 1:1.

Пример оригинальных наборов:

```text
Web Basics
Grayscale
Warm
Cool
Pastel
High Contrast
Ocean
Sunset
```

---

# 40. Palette UI

Grid цветов.

При выборе показывать:

```text
Preview
HEX
RGB
HSL
HSV
CSS color name when exact standard name exists
```

Actions:

```text
Copy
Open in Picker
Save to History
```

---

# 41. CSS Gradient Generator

Отдельная page:

```text
gradient.html
```

P0:

```text
Linear Gradient
Radial Gradient
```

P1:

```text
Conic Gradient
```

---

# 42. Linear Gradient

Настройки:

```text
angle
direction
color stops
stop positions
opacity
```

---

# 43. Radial Gradient

Настройки:

```text
circle / ellipse
position
color stops
```

---

# 44. Gradient stops

Каждый stop:

```text
color
position %
opacity
```

Actions:

```text
add
delete
duplicate
drag
```

Минимум 2 stops.

---

# 45. Gradient editor

Пример:

```text
Gradient Preview
────────────────────

[ draggable stops ]

Selected Stop
Color       #1E5799
Opacity     100%
Position    0%

Type        Linear
Angle       180°

CSS
────────────────────
background: linear-gradient(...);

[Copy CSS]
```

---

# 46. Modern CSS only

P0 генерирует:

```css
background: linear-gradient(180deg, #1E5799 0%, #2989D8 50%, #7DB9E8 100%);
```

Не генерировать:

```text
IE filters
ancient vendor prefixes
```

Это современное расширение.

---

# 47. Gradient presets

Создать собственные presets:

```text
Ocean
Sunset
Mint
Steel
Purple Glow
Soft Gray
Warm Orange
```

Не копировать чужой preset set 1:1.

---

# 48. Options page

Создать:

```text
options.html
```

Настройки:

```text
Eyedropper
☑ Show magnifier
☑ Outline hovered element
☑ Use crosshair
☑ Auto-copy
☑ Save to history

Default sample size
1×1 / 3×3 / 5×5 / 11×11 / 25×25

Sample mode
Average / Center

Copy format
HEX upper / HEX lower / RGB / RGBA / HSL / HSLA / HSV

History size
25 / 50 / 100 / 250

After picking
Exit / Continue
```

---

# 49. Keyboard shortcut

Добавить command:

```text
Start Pixel Color Picker
```

Пользователь может настраивать shortcut через:

```text
chrome://extensions/shortcuts
```

Не создавать fake shortcut assignment UI.

---

# 50. Picker overlay architecture

Injected picker — отдельный module:

```text
pickerOverlay.js
```

Состав:

```text
Shadow DOM root
toolbar
magnifier
crosshair
element outline
screenshot sampler
events
```

---

# 51. Shadow DOM isolation

Picker UI желательно рендерить в Shadow DOM:

```text
pixel-color-root
```

Чтобы CSS сайта не ломал UI.

Использовать очень высокий `z-index`.

---

# 52. Pointer events

```text
toolbar → pointer-events:auto
magnifier → pointer-events:none
visual overlays → pointer-events:none
```

`elementFromPoint()` должен находить страницу, а не overlay.

---

# 53. Cleanup

После закрытия picker:

```text
remove mousemove
remove click
remove scroll
remove resize
remove keydown
remove overlay
remove outline
release canvas
release bitmap/image
remove temporary markers
```

---

# 54. Re-entry

Если picker уже active:

```text
не создавать второй overlay
```

Сначала корректно cleanup/restart.

---

# 55. Protected pages

Не работать на:

```text
chrome://
chrome-extension://
Chrome Web Store
```

Сообщение:

```text
Pixel Color cannot inspect this protected Chrome page.
```

---

# 56. Screenshot failures

Обрабатывать:

```text
captureVisibleTab failure
permission denied
tab closed
unsupported page
```

---

# 57. Performance

Mousemove:

```text
requestAnimationFrame throttling
```

Не делать async Chrome API request на mousemove.

Sampling идет по already captured screenshot.

---

# 58. Color math module

Создать:

```text
colorMath.js
```

Функции:

```text
rgbToHex
hexToRgb
rgbToHsl
hslToRgb
rgbToHsv
hsvToRgb
parseCssColor
formatColor
averagePixels
```

P1:

```text
relativeLuminance
contrastRatio
```

---

# 59. Color model

```js
{
  r: 231,
  g: 72,
  b: 63,
  a: 1,

  hex: "#E7483F",
  hex8: "#E7483FFF",

  hsl: {
    h: 3,
    s: 76,
    l: 58
  },

  hsv: {
    h: 3,
    s: 69,
    v: 91
  }
}
```

---

# 60. History model

```js
{
  id,
  color,
  pickedAt,
  sourceDomain,
  sourceType: "page" | "system" | "manual" | "palette",
  favorite: false
}
```

---

# 61. Gradient model

```js
{
  type: "linear",
  angle: 180,
  stops: [
    {
      id: "a",
      color: "#1E5799",
      opacity: 1,
      position: 0
    },
    {
      id: "b",
      color: "#7DB9E8",
      opacity: 1,
      position: 100
    }
  ]
}
```

---

# 62. Multi-page extension architecture

Entry points:

```text
popup.html
color-picker.html
history.html
analyzer.html
palettes.html
gradient.html
options.html
```

Не превращать popup в гигантское приложение.

---

# 63. Service Worker

Responsibilities:

```text
start picker
capture viewport
open tool pages
coordinate messages
read/write settings
```

---

# 64. Messaging

Popup → service worker:

```js
{ type: "START_PICKER" }
{ type: "OPEN_COLOR_PICKER" }
{ type: "OPEN_HISTORY" }
{ type: "OPEN_ANALYZER" }
{ type: "OPEN_PALETTES" }
{ type: "OPEN_GRADIENT" }
```

Picker → service worker:

```js
{ type: "REQUEST_SCREENSHOT" }
{ type: "COLOR_PICKED", payload: {} }
{ type: "PICKER_CLOSED" }
```

---

# 65. Recommended project structure

```text
pixel-color/
├── public/
│   ├── manifest.json
│   └── icons/
│
├── src/
│   ├── background/
│   │   ├── service-worker.js
│   │   ├── captureViewport.js
│   │   └── messages.js
│   │
│   ├── popup/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── components/
│   │
│   ├── picker/
│   │   ├── startPicker.js
│   │   ├── pickerOverlay.js
│   │   ├── screenshotSampler.js
│   │   ├── coordinateMapper.js
│   │   ├── magnifier.js
│   │   ├── elementInspector.js
│   │   └── cleanupPicker.js
│   │
│   ├── color-picker/
│   │   ├── main.jsx
│   │   └── ColorPickerApp.jsx
│   │
│   ├── history/
│   │   ├── main.jsx
│   │   └── HistoryApp.jsx
│   │
│   ├── analyzer/
│   │   ├── main.jsx
│   │   ├── AnalyzerApp.jsx
│   │   ├── scanPageColors.js
│   │   ├── aggregateColors.js
│   │   └── highlightColor.js
│   │
│   ├── palettes/
│   │   ├── main.jsx
│   │   ├── PaletteApp.jsx
│   │   └── presets.js
│   │
│   ├── gradient/
│   │   ├── main.jsx
│   │   ├── GradientApp.jsx
│   │   ├── gradientSerializer.js
│   │   └── presets.js
│   │
│   ├── options/
│   │   ├── main.jsx
│   │   ├── OptionsApp.jsx
│   │   └── settingsStore.js
│   │
│   ├── color/
│   │   ├── colorMath.js
│   │   ├── colorParser.js
│   │   └── colorFormatter.js
│   │
│   ├── storage/
│   │   ├── historyStore.js
│   │   └── settingsStore.js
│   │
│   └── shared/
│       ├── constants.js
│       ├── messages.js
│       └── typedefs.js
│
├── tests/
│   ├── fixtures/
│   └── pages/
│
├── store/
│   ├── description.md
│   ├── privacy.md
│   └── permissions.md
│
├── popup.html
├── color-picker.html
├── history.html
├── analyzer.html
├── palettes.html
├── gradient.html
├── options.html
├── vite.config.js
├── package.json
├── README.md
└── LICENSE
```

---

# 66. Settings defaults

```js
{
  showMagnifier: true,
  outlineHoveredElement: true,
  useCrosshair: true,

  autoCopy: true,
  copyFormat: "hex-upper",

  saveHistory: true,
  historyLimit: 50,

  sampleSize: 1,
  sampleMode: "average",

  afterPick: "exit"
}
```

---

# 67. Storage

Использовать:

```text
chrome.storage.local
```

Только:

```text
settings
history
favorites
```

Не хранить:

```text
screenshots
HTML
DOM snapshots
full URL history
```

---

# 68. Tests — color math

Покрыть:

```text
RGB→HEX
HEX→RGB
RGB→HSL
HSL→RGB
RGB→HSV
HSV→RGB
alpha
short HEX
HEX8
invalid
rounding
```

---

# 69. Tests — average sampling

```text
1×1
3×3
5×5
uniform region
mixed region
viewport edges
```

---

# 70. Tests — coordinate mapper

Проверить:

```text
1x
2x
non-integer scale
HiDPI-like scale
browser zoom-like scale
viewport edges
different screenshot/client dimensions
```

---

# 71. Tests — picker lifecycle

```text
start
mousemove
pick
Esc
scroll recapture
resize recapture
cleanup
re-entry
```

---

# 72. Tests — Color parser

```text
#fff
#ffffff
#ffffffff
rgb()
rgba()
hsl()
hsla()
transparent
invalid
```

---

# 73. Tests — Analyzer

```text
text
background
border
fill
stroke
duplicates
transparent
hidden elements
```

---

# 74. Tests — Gradient

```text
2 stops
3 stops
position
opacity
angle
radial
serialization
```

---

# 75. Test pages

Создать:

```text
solid-colors.html
gradients.html
images.html
svg.html
canvas.html
video.html
transparent.html
scroll-page.html
zoom-test.html
many-colors.html
```

---

# 76. Manual QA — Picker

```text
[ ] Load unpacked
[ ] Popup
[ ] Pick starts
[ ] Screenshot captured
[ ] Overlay after capture
[ ] Crosshair
[ ] Magnifier
[ ] Correct HEX
[ ] Correct RGB
[ ] Correct HSL
[ ] Element info

[ ] 1×1
[ ] 3×3
[ ] 5×5
[ ] 11×11
[ ] 25×25

[ ] Average
[ ] Center

[ ] Auto-copy
[ ] History
[ ] Esc
[ ] Shift
[ ] R

[ ] Scroll refresh
[ ] Resize refresh
[ ] HiDPI
[ ] Browser zoom
[ ] Viewport edges

[ ] Images
[ ] Gradients
[ ] SVG
[ ] Canvas
[ ] Video snapshot

[ ] Overlay does not contaminate recapture
[ ] Cleanup
```

---

# 77. Manual QA — Other tools

Advanced Picker:

```text
[ ] HSV square
[ ] Hue
[ ] RGB
[ ] HSL
[ ] HEX
[ ] Alpha
[ ] Current/New
[ ] Copy
[ ] History
```

History:

```text
[ ] Add
[ ] Limit
[ ] Copy
[ ] Delete
[ ] Clear
[ ] Open in Picker
```

Analyzer:

```text
[ ] Scan
[ ] Counts
[ ] Filters
[ ] SVG
[ ] Copy
[ ] Highlight
```

Palettes:

```text
[ ] 7+ presets
[ ] Grid
[ ] Details
[ ] Copy
[ ] Picker
[ ] History
```

Gradient:

```text
[ ] Linear
[ ] Radial
[ ] Angle
[ ] Stops
[ ] Opacity
[ ] Drag
[ ] Preview
[ ] CSS
[ ] Copy
```

Options:

```text
[ ] Magnifier
[ ] Outline
[ ] Crosshair
[ ] Auto-copy
[ ] Format
[ ] Sample size
[ ] Sample mode
[ ] History limit
[ ] After-pick
```

---

# 78. UI style

Собственный современный light UI:

```text
white
neutral gray
clean color swatches
subtle borders
compact cards
small shadows
rainbow/color accent
```

Не копировать ColorZilla визуально.

---

# 79. Icon

Собственный icon:

```text
eyedropper + pixel
```

или:

```text
pixel grid + color wheel
```

Размеры:

```text
16
32
48
128
```

---

# 80. Privacy

Создать:

```text
store/privacy.md
```

Текст по смыслу:

```text
Pixel Color processes color information locally in the browser.

Temporary screenshots of the visible tab are used only for pixel sampling and are not uploaded or stored persistently.

Picked colors and settings may be saved locally in Chrome storage.

Page HTML, screenshots and browsing activity are not sent to developer-owned servers.

No analytics or tracking are included in version 1.0.
```

---

# 81. Permissions explanation

Создать:

```text
store/permissions.md
```

### activeTab

```text
Used after the user starts the picker or analyzer to inspect the active webpage and capture the visible viewport for pixel sampling.
```

### scripting

```text
Used to inject the local picker, analyzer and temporary highlight overlays.
```

### storage

```text
Used to save Pixel Color settings and picked-color history locally in Chrome.
```

---

# 82. Store description

Создать:

```text
store/description.md
```

Short:

```text
Pick colors from webpages, inspect pixels, analyze palettes and generate modern CSS gradients.
```

Long description:

```text
Eyedropper
Magnifier
1×1 / 3×3 / 5×5 / 11×11 / 25×25 sampling
Average area color
Advanced Color Picker
Color History
Webpage Color Analyzer
Palette Browser
CSS Gradient Generator
HEX/RGB/HSL/HSV
Auto-copy
Local processing
```

---

# 83. README

README на английском:

```text
Pixel Color
Features
Eyedropper architecture
Screenshot sampling
Coordinate scaling
Sample sizes
Magnifier
Advanced Picker
History
Webpage Analyzer
Palette Browser
Gradient Generator
Permissions
Privacy
Browser limitations
Development
Build
Load unpacked
Tests
Known limitations
Roadmap
```

---

# 84. Known limitations

README честно описывает:

```text
Pixel sampling uses a screenshot of the visible webpage viewport.

The screenshot is refreshed after scroll/resize and can be refreshed manually for dynamic content.

Protected Chrome pages cannot be captured.

Native EyeDropper support depends on browser/OS.

Cross-origin frames can be visually sampled as part of the screenshot, but direct DOM analysis may be limited.

captureVisibleTab samples webpage viewport content, not arbitrary browser chrome UI.
```

---

# 85. Build scripts

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "...",
    "test:watch": "...",
    "lint": "...",
    "package": "..."
  }
}
```

---

# 86. Build

```bash
npm run build
```

Результат:

```text
dist/
```

Загружается:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
→ dist/
```

---

# 87. Release ZIP

```bash
npm run package
```

Создает:

```text
release/pixel-color-v1.0.0.zip
```

---

# 88. P0 — обязательный MVP

Без этого задача не завершена:

```text
Manifest V3
React 19
Vite 8
JavaScript
Light UI

Popup menu

Pick Color From Page
captureVisibleTab
real screenshot sampling
coordinate scaling
magnifier
crosshair
element outline
element info

1×1
3×3
5×5
11×11
25×25

Average
Center

HEX
RGB
HSL
HSV

Auto-copy
Manual copy
History

Esc
R
Shift

Scroll recapture
Resize recapture
Overlay-safe recapture
Cleanup

Advanced Color Picker
Hue
SV field
RGB
HSL
HSV
HEX
Alpha
Current/New
Copy
Save history

History page
Limit
Copy
Delete
Clear
Open in picker

Webpage Analyzer
Text
Background
Borders
SVG fill/stroke
Aggregation
Counts
Filters
Copy
Highlight

Palette Browser
7+ original presets
Details
Copy
Open picker
Save history

Gradient Generator
Linear
Radial
Stops
Positions
Opacity
Angle
Preview
Modern CSS
Copy CSS
Original presets

Options
Magnifier
Outline
Crosshair
Auto-copy
Format
Sample size
Sample mode
History size
After-pick

activeTab
scripting
storage

Protected-page handling
Screenshot error handling

Tests
Build
ZIP
README
Store description
Privacy
Permissions
```

---

# 89. P1

После стабильного P0:

```text
Native EyeDropper / Pick Anywhere
Favorites
Export palette
History import/export
Conic gradients
Import CSS gradient
Dominant screenshot colors
Contrast checker
WCAG ratio
Magnifier zoom settings
Arrow-key pixel navigation
Auto-refresh dynamic screenshot
Open Shadow DOM analyzer
Same-origin iframe analyzer
CSS variable color extraction
Shadow/gradient color extraction
Nearest color names
```

---

# 90. P2

Не делать до стабильного P0/P1:

```text
Full-page screenshot palette extraction
Image upload picker
AI palette recommendations
Website-wide audit
Design-system generation
Cloud sync
Accounts
Teams
Figma integration
Remote APIs
```

---

# 91. Что запрещено

Не добавлять:

```text
backend
Firebase
Supabase
accounts
auth
analytics
telemetry
tracking
AI
remote scripts
screenshot uploads
persistent screenshot storage
```

Не копировать:

```text
ColorZilla source
ColorZilla logo
ColorZilla exact UI
ColorZilla screenshots/assets
ColorZilla preset library 1:1
ColorZilla copywriting
```

---

# 92. Не делать fake pixel picker

Запрещено выдавать:

```text
getComputedStyle(element).backgroundColor
```

за полноценную пипетку.

Основной Pick Color From Page должен использовать screenshot raster sampling.

---

# 93. Не делать screenshot на mousemove

Запрещено:

```text
mousemove
→ captureVisibleTab
```

Screenshot обновляется только:

```text
picker start
scroll
resize
manual refresh
optional future dynamic refresh
```

Mousemove работает по уже захваченному image.

---

# 94. Definition of Done

Готово только если:

1. Extension устанавливается.
2. Popup работает.
3. Picker запускается.
4. Реальный screenshot используется.
5. Mapping корректен на HiDPI.
6. Mapping корректен при zoom.
7. Magnifier работает.
8. Crosshair работает.
9. Element outline работает.
10. Element info работает.
11. 1×1 работает.
12. 3×3 работает.
13. 5×5 работает.
14. 11×11 работает.
15. 25×25 работает.
16. Average корректен.
17. HEX корректен.
18. RGB корректен.
19. HSL корректен.
20. HSV корректен.
21. Auto-copy работает.
22. History работает.
23. Scroll recapture работает.
24. Resize recapture работает.
25. Overlay не попадает в recaptured screenshot.
26. Cleanup работает.
27. Advanced Picker работает.
28. History page работает.
29. Analyzer работает.
30. Palette Browser работает.
31. Gradient Generator работает.
32. Options работают.
33. Protected pages обработаны.
34. Tests проходят.
35. Build проходит.
36. ZIP создается.
37. README готов.
38. Store files готовы.
39. Screenshots не сохраняются.
40. Backend отсутствует.

---

# 95. План выполнения AI Coding Agent

## Этап 1 — Scaffold

Создать:

```text
Manifest V3
React
Vite
popup
service worker
tool pages
icons
```

Проверить `Load unpacked`.

## Этап 2 — Color Math

Сначала реализовать и протестировать:

```text
HEX
RGB
HSL
HSV
Alpha
Parser
Formatter
Average
```

## Этап 3 — Screenshot Capture

Реализовать:

```text
captureVisibleTab
message transport
bitmap/canvas
cleanup
```

## Этап 4 — Coordinate Mapper

Реализовать и протестировать:

```text
client → screenshot
HiDPI
zoom
edges
```

## Этап 5 — Basic Picker

```text
mousemove
1×1
HEX/RGB
click
Esc
cleanup
```

## Этап 6 — Magnifier / Toolbar

```text
magnifier
pixel grid
crosshair
toolbar
```

## Этап 7 — Multi-sampling

```text
3×3
5×5
11×11
25×25
Average
Center
```

## Этап 8 — DOM Info

```text
tag
id
class
dimensions
outline
```

## Этап 9 — Recapture

```text
scroll
resize
hide overlay
capture
restore
```

## Этап 10 — Clipboard / History

```text
auto-copy
formats
historyStore
```

## Этап 11 — Popup Menu

Связать все tools.

## Этап 12 — Advanced Picker

Сделать synchronized color editor.

## Этап 13 — History

Сделать history page.

## Этап 14 — Analyzer

Сделать page color scan, aggregation, filters, highlight.

## Этап 15 — Palette Browser

Создать оригинальные presets.

## Этап 16 — Gradient Generator

Сделать linear/radial editor и CSS export.

## Этап 17 — Options

Сделать settings store и UI.

## Этап 18 — Errors

Проверить:

```text
protected page
capture failure
clipboard failure
tab close
re-entry
```

## Этап 19 — Tests

Покрыть core modules.

## Этап 20 — Manual QA

Проверить:

```text
normal site
news site
e-commerce
images
SVG
canvas
video
gradient
scroll
zoom
HiDPI
```

## Этап 21 — Build

Запустить:

```bash
npm run lint
npm test
npm run build
npm run package
```

Исправить все ошибки.

## Этап 22 — Chrome Web Store

Подготовить:

```text
README
store/description.md
store/privacy.md
store/permissions.md
release/pixel-color-v1.0.0.zip
```

---

# 96. Правила AI Agent

Не делать fake sampling.

Не hard-code colors.

Не использовать CSS-only color вместо pixel sampling.

Не делать capture на mousemove.

Не сохранять screenshots.

Не отправлять screenshots наружу.

Не добавлять TypeScript.

Не добавлять backend.

Не добавлять remote scripts/CDN.

Не копировать ColorZilla UI/assets/source.

Не оставлять overlay/listeners после Exit.

Не игнорировать zoom/DPR.

Не считать CSS px равным screenshot px без actual mapping.

Не генерировать legacy IE gradient code в основном output.

---

# 97. Приоритеты

```text
1. Correct pixel sampling
2. Correct coordinate mapping
3. Privacy
4. Picker performance
5. Overlay reliability
6. Color conversion correctness
7. UX
8. Analyzer usefulness
9. Visual polish
```

---

# 98. Итоговый ожидаемый результат

AI Agent должен предоставить:

```text
1. Полный исходный код
2. Рабочий Chrome Extension
3. dist/
4. release/pixel-color-v1.0.0.zip
5. README.md
6. Automated tests
7. Test pages/fixtures
8. store/description.md
9. store/privacy.md
10. store/permissions.md
11. Краткий отчет:
    - как работает pixel sampling;
    - как учитывается zoom / DPR;
    - sample sizes;
    - magnifier;
    - analyzer;
    - palettes;
    - gradient generator;
    - permissions;
    - limitations;
    - P1/P2 roadmap.
```

---

# 99. Финальная продуктовая формулировка

**Pixel Color** — Chrome Extension для работы с цветами на веб-страницах.

Основные инструменты:

```text
Pixel Eyedropper
Magnifier
Multi-pixel Sampling
Average Color
Advanced Color Picker
Color History
Webpage Color Analyzer
Palette Browser
CSS Gradient Generator
```

Pixel Color получает цвет из rendered webpage screenshot, поэтому может работать с визуальными пикселями:

```text
images
gradients
SVG
canvas
video snapshots
transparency/composited content
```

Форматы:

```text
HEX
RGB
RGBA
HSL
HSLA
HSV
```

Ключевой UX:

> Pick a color from any visible webpage pixel, inspect it, save it, convert it, analyze the page palette or build a CSS gradient.

Privacy:

> Pixel Color processes screenshots and colors locally in Chrome. Temporary screenshots are used only for pixel sampling and are never uploaded or stored persistently.
