import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const W = 1200, H = 630;

// 1. favicon 放大成 180x180（apple-touch-icon）
const fav = readFileSync('public/favicon.svg');
await sharp(fav, { density: 600 })
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');
await sharp(fav, { density: 600 })
  .resize(32, 32)
  .png()
  .toFile('public/favicon-32.png');
console.log('icons done');

// 2. OG 卡片 1200x630
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#faf8f4"/>
  <rect x="0" y="0" width="${W}" height="8" fill="#9a2b1e"/>

  <g transform="translate(90, 150)">
    <rect width="72" height="72" rx="16" fill="#ffffff" stroke="#e4dfd6" stroke-width="1.5"/>
    <g stroke="#9a2b1e" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(8,8) scale(2.3333)">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
    </g>
  </g>

  <text x="90" y="330" font-family="Songti SC, Noto Serif SC, serif" font-size="86" font-weight="600" fill="#1c1b19">江相派</text>
  <text x="90" y="410" font-family="Songti SC, Noto Serif SC, serif" font-size="44" fill="#57534e">江湖上的宰相</text>

  <rect x="90" y="470" width="180" height="4" fill="#9a2b1e"/>
  <text x="90" y="540" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="26" fill="#8a857f">四本秘本全文 · 行骗流程 · 骗局机制</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/og.png');

console.log('og.png done');
