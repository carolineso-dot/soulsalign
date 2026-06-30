/**
 * Generates an on-brand SVG "portrait" for a seed profile — committed as a
 * static asset so it always loads on any deployed build (no external image
 * dependency, no broken-image risk). Operators replace these with real photos.
 */

const PALETTES: [string, string][] = [
  ["#7e3340", "#2f2535"],
  ["#a8843b", "#7e3340"],
  ["#4e4a63", "#2f2535"],
  ["#5f7268", "#2f2535"],
  ["#8c857a", "#4e4a63"],
  ["#a45562", "#2f2535"],
  ["#c9a85f", "#a8843b"],
];

export function portraitSvg(opts: {
  initials: string;
  glyph: string; // zodiac or element glyph
  sign: string; // small caption (e.g. sun sign)
  variant: number;
}): string {
  const [c1, c2] = PALETTES[opts.variant % PALETTES.length];
  const angle = 120 + (opts.variant % 5) * 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#f4e3b4" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#f4e3b4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="760" fill="url(#bg)"/>
  <rect width="600" height="760" fill="url(#glow)"/>
  <g fill="none" stroke="#f4e3b4" stroke-opacity="0.22">
    <circle cx="300" cy="300" r="190"/>
    <circle cx="300" cy="300" r="130"/>
  </g>
  <circle cx="490" cy="170" r="9" fill="#f4e3b4" fill-opacity="0.9"/>
  <circle cx="118" cy="430" r="7" fill="#f4e3b4" fill-opacity="0.7"/>
  <text x="300" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="200" fill="#fbf9f5" fill-opacity="0.96" text-anchor="middle" dominant-baseline="middle" letter-spacing="6">${opts.initials}</text>
  <text x="300" y="560" font-family="Georgia, serif" font-size="120" fill="#f4e3b4" fill-opacity="0.85" text-anchor="middle">${opts.glyph}</text>
  <text x="300" y="660" font-family="Inter, system-ui, sans-serif" font-size="30" fill="#fbf9f5" fill-opacity="0.85" text-anchor="middle" letter-spacing="8" style="text-transform:uppercase">${opts.sign.toUpperCase()}</text>
</svg>`;
}
