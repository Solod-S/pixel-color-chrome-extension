import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 420" width="1280" height="420" fill="none">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1280" y2="420" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>

    <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>

    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F43F5E" />
      <stop offset="50%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>

    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(30, 41, 59, 0.75)" />
      <stop offset="100%" stop-color="rgba(15, 23, 42, 0.85)" />
    </linearGradient>

    <!-- Filters for glow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.5" />
    </filter>

    <!-- Grid Pattern -->
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="420" fill="url(#bgGrad)" />
  <rect width="1280" height="420" fill="url(#grid)" />

  <!-- Ambient Light Orbs -->
  <circle cx="200" cy="100" r="180" fill="#3B82F6" opacity="0.18" filter="url(#glow)" />
  <circle cx="1080" cy="320" r="220" fill="#EC4899" opacity="0.15" filter="url(#glow)" />
  <circle cx="700" cy="200" r="140" fill="#8B5CF6" opacity="0.12" filter="url(#glow)" />

  <!-- Header Branding Box -->
  <g transform="translate(80, 70)">
    <!-- App Icon Frame -->
    <rect x="0" y="0" width="80" height="80" rx="20" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
    
    <!-- Color Grid Icon Inside -->
    <g transform="translate(16, 16)">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#EF4444" />
      <rect x="26" y="0" width="22" height="22" rx="5" fill="#3B82F6" />
      <rect x="0" y="26" width="22" height="22" rx="5" fill="#10B981" />
      <rect x="26" y="26" width="22" height="22" rx="5" fill="#F59E0B" />
    </g>

    <!-- App Title & Tagline -->
    <text x="104" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">
      Pixel Color
    </text>
    <text x="312" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#38BDF8" letter-spacing="0.05em">
      PRO V1.0
    </text>
    <text x="104" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#94A3B8">
      Professional Pixel Eyedropper, Palette Analyzer &amp; CSS Gradient Suite for Chrome
    </text>
  </g>

  <!-- Interactive Features Row / Floating Badges -->
  <g transform="translate(80, 200)">
    <!-- Card 1: True Eyedropper -->
    <g transform="translate(0, 0)">
      <rect width="255" height="150" rx="14" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" filter="url(#softShadow)" />
      <circle cx="34" cy="36" r="16" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" stroke-width="1.5" />
      <!-- Eyedropper Icon -->
      <path d="M 28 42 L 32 38 L 40 30 C 41 29 42 29 43 30 C 44 31 44 32 43 33 L 35 41 L 31 45 L 26 46 Z" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="60" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">True Eyedropper</text>
      <text x="20" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#94A3B8">
        <tspan x="20" dy="0">Raster viewport sampling</tspan>
        <tspan x="20" dy="20">HiDPI / Retina zoom scaling</tspan>
        <tspan x="20" dy="20">11×11 Magnifier loupe</tspan>
      </text>
    </g>

    <!-- Card 2: 2D Color Picker -->
    <g transform="translate(285, 0)">
      <rect width="255" height="150" rx="14" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" filter="url(#softShadow)" />
      <circle cx="34" cy="36" r="16" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" stroke-width="1.5" />
      <!-- Sliders Icon -->
      <path d="M 26 32 L 42 32 M 30 30 L 30 34 M 26 40 L 42 40 M 38 38 L 38 42" stroke="#F43F5E" stroke-width="1.5" stroke-linecap="round" />
      <text x="60" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">2D Color Studio</text>
      <text x="20" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#94A3B8">
        <tspan x="20" dy="0">Interactive SV field</tspan>
        <tspan x="20" dy="20">Synchronized HEX / RGB / HSL</tspan>
        <tspan x="20" dy="20">Quick tone adjustments</tspan>
      </text>
    </g>

    <!-- Card 3: DOM Analyzer -->
    <g transform="translate(570, 0)">
      <rect width="255" height="150" rx="14" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" filter="url(#softShadow)" />
      <circle cx="34" cy="36" r="16" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" stroke-width="1.5" />
      <!-- Search/Analyze Icon -->
      <circle cx="33" cy="35" r="6" stroke="#10B981" stroke-width="1.5" />
      <path d="M 38 40 L 43 45" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" />
      <text x="60" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">DOM Analyzer</text>
      <text x="20" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#94A3B8">
        <tspan x="20" dy="0">Computed style scanner</tspan>
        <tspan x="20" dy="20">Text, BG, Border &amp; SVG breakdown</tspan>
        <tspan x="20" dy="20">Live element highlighter</tspan>
      </text>
    </g>

    <!-- Card 4: Gradient & Palettes -->
    <g transform="translate(855, 0)">
      <rect width="255" height="150" rx="14" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.08)" stroke-width="1" filter="url(#softShadow)" />
      <circle cx="34" cy="36" r="16" fill="rgba(139, 92, 246, 0.15)" stroke="#8B5CF6" stroke-width="1.5" />
      <!-- Layers Icon -->
      <path d="M 34 28 L 42 32 L 34 36 L 26 32 Z M 26 36 L 34 40 L 42 36 M 26 40 L 34 44 L 42 40" stroke="#C084FC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="60" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">Gradients &amp; Palettes</text>
      <text x="20" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#94A3B8">
        <tspan x="20" dy="0">Multi-stop visual stops</tspan>
        <tspan x="20" dy="20">8 Curated design palettes</tspan>
        <tspan x="20" dy="20">1-Click CSS / SCSS export</tspan>
      </text>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.resolve(rootDir, "assets/banner.svg"), bannerSvg, "utf8");
fs.writeFileSync(
  path.resolve(rootDir, "store/assets/promo_marquee_1400x560.svg"),
  bannerSvg,
  "utf8",
);
console.log(
  "✓ Generated assets/banner.svg and store/assets/promo_marquee_1400x560.svg",
);
