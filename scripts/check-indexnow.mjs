/**
 * 校验 IndexNow 推送清单与实际页面一致。
 *
 * 三方比对：dist 实际页面 / sitemap-0.xml / 脚本内置兜底清单。
 * 兜底清单是硬编码的，新增页面时容易漏 —— 这个脚本专门抓这个。
 *
 * 已接入 CI：build job 的校验步骤会跑。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BASE = '/jiangxiang-school';

/**
 * dist 下所有 index.html → URL 路径。
 * 统一表示：'/' 或 'abc/'（不带前导斜杠，带尾部斜杠）。
 */
function pagesInDist() {
  const out = [];
  (function walk(dir) {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (n === 'index.html') {
        // p 形如 <ROOT>/dist/abao/index.html → 'abao/'；dist/index.html → '/'
        let rel = p.slice(DIST.length).replace(/\\/g, '/'); // '/abao/index.html'
        rel = rel.replace(/\/index\.html$/, '');          // '/abao'
        out.push(rel === '' ? '/' : rel + '/');          // 'abao/'
      }
    }
  })(DIST);
  return new Set(out);
}

const pages = pagesInDist();

// sitemap
const sitemapFile = join(DIST, 'sitemap-0.xml');
const sitemap = new Set(
  [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname.slice(BASE.length) || '/')
);

// 兜底清单：从脚本源码里抽出 return [...] 那段。
// 三方统一用「带前导斜杠」表示：'/' 或 '/abc/'。
// 兜底项本身不带前导斜杠（'abc/'），这里补上，与 dist / sitemap 对齐。
const src = readFileSync(join(ROOT, 'scripts', 'indexnow-push.mjs'), 'utf8');
const block = src.match(/内置页面清单[\s\S]*?return \[([\s\S]*?)\]\.map/);
if (!block) {
  console.error('!! 无法从 indexnow-push.mjs 解析兜底清单（代码结构变了？）');
  process.exit(1);
}
const fallback = new Set(
  [...block[1].matchAll(/'([^']*)'/g)].map((m) => (m[1] === '' ? '/' : '/' + m[1]))
);

// key 文件规范：{key}.txt，内容与文件名一致（IndexNow Option 1 要求）
const pubFiles = readdirSync(join(ROOT, 'public')).filter((f) => f.endsWith('.txt'));
let ok = true;
for (const f of pubFiles) {
  const expected = f.replace(/\.txt$/, '');
  const actual = readFileSync(join(ROOT, 'public', f), 'utf8').trim();
  if (expected !== actual) {
    ok = false;
    console.error(`!! key 文件内容与文件名不一致：${f} 的内容是 ${JSON.stringify(actual)}`);
  }
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(expected)) {
    ok = false;
    console.error(`!! key 文件名不符合规范（需 8-128 位 a-zA-Z0-9-）：${f}`);
  }
}
if (!pubFiles.some((f) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(f))) {
  ok = false;
  console.error('!! public/ 下没有 {key}.txt 形式的 key 文件');
}

const diff = (a, b) => [...a].filter((x) => !b.has(x)).sort();

const rows = [
  ['sitemap 漏掉页面', diff(pages, sitemap)],
  ['sitemap 多出页面', diff(sitemap, pages)],
  ['兜底清单漏掉页面', diff(pages, fallback)],
  ['兜底清单多出页面', diff(fallback, pages)],
];
for (const [label, list] of rows) {
  if (list.length) {
    ok = false;
    console.error(`!! ${label}: ${list.join(', ')}`);
  }
}

console.log(`实际页面 ${pages.size} · sitemap ${sitemap.size} · 兜底 ${fallback.size}`);
if (ok) console.log('IndexNow 推送清单一致 ✓');
else {
  console.error('\n新增或删除页面后，记得同步 indexnow-push.mjs 的兜底清单。');
  process.exit(1);
}
