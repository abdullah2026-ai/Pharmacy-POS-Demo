// Reliable Image Asset Pipeline & Fallbacks for Production & Static Deployments (Cloudflare Pages / Workers)
import pharmacistBannerFile from '../assets/images/pharmacist_banner_1792908540114.jpg';
import superadminAvatarFile from '../assets/images/superadmin_avatar_1792908539605.jpg';

// Vector SVG Fallback for Doctor / Superadmin Avatar (rendered if network or asset fails)
export const SVG_AVATAR_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#062822"/>
      <stop offset="100%" stop-color="#0d453b"/>
    </linearGradient>
    <linearGradient id="coat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg)" rx="36"/>
  <!-- Doctor silhouette with stethoscope -->
  <circle cx="100" cy="72" r="38" fill="#fecaca"/>
  <path d="M70 70 Q100 48 130 70 Q130 50 100 46 Q70 50 70 70" fill="#1e293b"/>
  <!-- Coat -->
  <path d="M42 185 C42 135 68 120 100 120 C132 120 158 135 158 185 Z" fill="url(#coat)"/>
  <!-- Stethoscope -->
  <path d="M78 126 C78 160 122 160 122 126" fill="none" stroke="#bbf246" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="122" cy="122" r="4.5" fill="#bbf246"/>
  <circle cx="78" cy="122" r="4.5" fill="#bbf246"/>
  <circle cx="100" cy="158" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
  <!-- DGDA verified badge -->
  <circle cx="160" cy="40" r="14" fill="#bbf246"/>
  <path d="M154 40 L158 44 L167 35" fill="none" stroke="#062822" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

// Vector SVG Fallback for Pharmacist Efficiency Banner
export const SVG_BANNER_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <defs>
    <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#041b17"/>
      <stop offset="60%" stop-color="#062822"/>
      <stop offset="100%" stop-color="#0a3d34"/>
    </linearGradient>
    <linearGradient id="limeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#bbf246" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
  <rect width="600" height="360" fill="url(#bannerBg)"/>
  
  <!-- Subtle tech grid -->
  <g stroke="rgba(187,242,70,0.07)" stroke-width="1">
    <line x1="0" y1="60" x2="600" y2="60"/>
    <line x1="0" y1="120" x2="600" y2="120"/>
    <line x1="0" y1="180" x2="600" y2="180"/>
    <line x1="0" y1="240" x2="600" y2="240"/>
    <line x1="0" y1="300" x2="600" y2="300"/>
    <line x1="120" y1="0" x2="120" y2="360"/>
    <line x1="240" y1="0" x2="240" y2="360"/>
    <line x1="360" y1="0" x2="360" y2="360"/>
    <line x1="480" y1="0" x2="480" y2="360"/>
  </g>

  <!-- Glowing pill graphic in background -->
  <g transform="translate(420, 150) rotate(-28)">
    <rect x="-60" y="-120" width="120" height="240" rx="60" fill="#062822" stroke="#bbf246" stroke-width="4" opacity="0.35"/>
    <line x1="-60" y1="0" x2="60" y2="0" stroke="#bbf246" stroke-width="4" opacity="0.5"/>
  </g>

  <!-- Modern Pharmacist Silhouette & Cross -->
  <g transform="translate(450, 180)">
    <circle cx="0" cy="0" r="50" fill="none" stroke="url(#limeGlow)" stroke-width="3"/>
    <rect x="-6" y="-28" width="12" height="56" rx="4" fill="#bbf246"/>
    <rect x="-28" y="-6" width="56" height="12" rx="4" fill="#bbf246"/>
  </g>

  <!-- Efficiency Banner Typography -->
  <text x="40" y="80" fill="#bbf246" font-family="system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="2">DGDA WORKFLOW CERTIFIED</text>
  <text x="40" y="130" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" font-weight="800">Pharmacy Efficiency &</text>
  <text x="40" y="170" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" font-weight="800">Smart Dispensing</text>
  <text x="40" y="215" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14" font-weight="500">Fast batch scanning, cold-chain monitoring & Gazipur dispatch</text>

  <!-- Metric badges -->
  <g transform="translate(40, 260)">
    <rect width="130" height="42" rx="12" fill="#0a3d34" stroke="rgba(187,242,70,0.3)" stroke-width="1"/>
    <text x="14" y="26" fill="#bbf246" font-family="monospace" font-size="16" font-weight="700">99.8%</text>
    <text x="75" y="26" fill="#cbd5e1" font-family="system-ui" font-size="11">Accuracy</text>
  </g>
  <g transform="translate(185, 260)">
    <rect width="140" height="42" rx="12" fill="#0a3d34" stroke="rgba(187,242,70,0.3)" stroke-width="1"/>
    <text x="14" y="26" fill="#bbf246" font-family="monospace" font-size="16" font-weight="700">&lt; 15 min</text>
    <text x="82" y="26" fill="#cbd5e1" font-family="system-ui" font-size="11">Dispatch</text>
  </g>
</svg>
`)}`;

/**
 * Returns a resilient URL for user avatars.
 * Prioritizes custom URLs, then bundled assets, then static /images, and falls back to SVG.
 */
export function getSafeAvatarUrl(url?: string | null): string {
  if (url && !url.includes('/src/assets/')) {
    return url;
  }
  return superadminAvatarFile || '/images/superadmin_avatar_1792908539605.jpg' || SVG_AVATAR_FALLBACK;
}

/**
 * Returns a resilient URL for the pharmacist banner.
 */
export function getSafeBannerUrl(url?: string | null): string {
  if (url && !url.includes('/src/assets/')) {
    return url;
  }
  return pharmacistBannerFile || '/images/pharmacist_banner_1792908540114.jpg' || SVG_BANNER_FALLBACK;
}
