/** 由 favicon.svg 生成多尺寸 favicon.ico */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const fav = readFileSync('public/favicon.svg');
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(fav, { density: 600 }).resize(s, s).png().toBuffer())
);

// 手工封装 ICO（PNG 压缩格式）：6 字节头 + 16 字节目录项 + 各图像数据
const count = pngs.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);        // reserved
header.writeUInt16LE(1, 2);        // type = icon
header.writeUInt16LE(count, 4);    // count

const dir = Buffer.alloc(16 * count);
let offset = 6 + 16 * count;
pngs.forEach((png, i) => {
  const e = 16 * i;
  dir.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], e + 0);   // width
  dir.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], e + 1);   // height
  dir.writeUInt8(0, e + 2);        // 调色板数
  dir.writeUInt8(0, e + 3);        // reserved
  dir.writeUInt16LE(1, e + 4);     // color planes
  dir.writeUInt16LE(32, e + 6);    // bpp
  dir.writeUInt32LE(png.length, e + 8);
  dir.writeUInt32LE(offset, e + 12);
  offset += png.length;
});

writeFileSync('public/favicon.ico', Buffer.concat([header, dir, ...pngs]));
console.log(`favicon.ico written: ${sizes.join(', ')}`);
