import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'public', 'icons');
await fs.mkdir(OUT, { recursive: true });

// Orbit emblem on aubergine rounded tile. `pad` adds safe-zone for maskable.
function iconSvg({ size = 512, pad = 0.0, rings = true } = {}) {
  const cx = 256, cy = 256;
  const tile = 512;
  const inset = tile * pad;
  const r = (tile - inset * 2) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f4e3b4"/><stop offset="45%" stop-color="#c9a85f"/><stop offset="100%" stop-color="#a8843b"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a8843b" stop-opacity="0.55"/><stop offset="100%" stop-color="#a8843b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="claret" cx="35%" cy="35%" r="70%"><stop offset="0%" stop-color="#a45562"/><stop offset="100%" stop-color="#7e3340"/></radialGradient>
    <radialGradient id="gold" cx="35%" cy="35%" r="70%"><stop offset="0%" stop-color="#c9a85f"/><stop offset="100%" stop-color="#a8843b"/></radialGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="112" fill="#2f2535"/>
  ${rings ? `<g fill="none" stroke="#a8843b" stroke-opacity="0.4">
    <circle cx="${cx}" cy="${cy}" r="170" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="108" stroke="#7e3340" stroke-opacity="0.4" stroke-width="3"/>
  </g>` : ''}
  <circle cx="${cx}" cy="${cy}" r="70" fill="url(#glow)"/>
  <circle cx="${cx}" cy="${cy}" r="34" fill="url(#core)"/>
  <circle cx="${cx + 170}" cy="${cy}" r="26" fill="url(#claret)"/>
  <circle cx="${cx - 108}" cy="${cy}" r="22" fill="url(#gold)"/>
</svg>`;
}

async function render(svg, file, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, file));
  console.log('  ✓', file);
}

await render(iconSvg({ rings: true }), 'icon-192.png', 192);
await render(iconSvg({ rings: true }), 'icon-512.png', 512);
await render(iconSvg({ rings: true }), 'apple-touch-icon.png', 180);
// maskable: rings off + the safe zone is naturally covered by the full-bleed tile
await render(iconSvg({ rings: true }), 'icon-maskable-512.png', 512);
console.log('icons done');
