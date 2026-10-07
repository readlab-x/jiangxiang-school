/**
 * 布局验证：模拟 CSS Grid 的列分配，确认三元素各落其位。
 * 直接读构建产物里的 HTML + CSS，不依赖浏览器。
 */
import { readFileSync, readdirSync } from 'node:fs';

const base = 'dist';
const html = readFileSync(`${base}/yingyao/index.html`, 'utf8');
const cssFile = readdirSync(`${base}/_astro`).find((f) => f.endsWith('.css'));
const css = readFileSync(`${base}/_astro/${cssFile}`, 'utf8');

const rule = (sel) => {
  const i = css.indexOf(sel);
  if (i < 0) return null;
  const j = css.indexOf('}', i);
  return css.slice(i, j + 1);
};

const prop = (sel, name) => {
  const r = rule(sel);
  if (!r) return null;
  const m = r.match(new RegExp(`${name}:([^;}]+)`));
  return m ? m[1].trim() : null;
};

console.log('=== CSS 规则 ===');
for (const sel of ['.reader', '.rd-flow', '.rd-no', '.rd-orig', '.rd-note', '.rd-sec-title']) {
  console.log(`${sel.padEnd(14)} display=${prop(sel, 'display')}  column=${prop(sel, 'grid-column')}`);
}

console.log('\n=== HTML 结构 ===');
// rd-flow 内是否直接平铺三元素（不含 rd-row 包裹）
const flow = html.slice(html.indexOf('<div class="rd-flow">'), html.indexOf('<div class="pager">'));
const counts = {
  'rd-no': (flow.match(/class="rd-no"/g) || []).length,
  'rd-orig': (flow.match(/class="rd-orig"/g) || []).length,
  'rd-note': (flow.match(/class="rd-note"/g) || []).length,
  'rd-row 包裹': (flow.match(/class="rd-row"/g) || []).length,
  'rd-sec-title': (flow.match(/class="rd-sec-title"/g) || []).length,
};
for (const [k, v] of Object.entries(counts)) console.log(`${k.padEnd(16)} ${v}`);

console.log('\n=== 断点 ===');
// 构建器会把 (max-width: N) 改写成范围语法 (width<=N)
const medias = [...css.matchAll(/@media\s*\(([^)]+)\)\{/g)].map((m) => m[1]);
console.log(`全部媒体查询: ${medias.join(' / ')}`);
for (const bp of ['1080', '720']) {
  const re = new RegExp(`@media\\s*\\([^)]*(?:max-width:\\s*${bp}|width<=\\s*${bp})[^)]*\\)\\{`);
  const i = css.search(re);
  if (i < 0) {
    console.log(`≤${bp}px: 未找到`);
    continue;
  }
  // 在该 media 块内找 rd-note / rd-no 的覆盖规则
  const block = css.slice(i, i + 900);
  const note = block.match(/\.rd-note\{[^}]*\}/)?.[0] ?? '—';
  const no = block.match(/\.rd-no\{[^}]*\}/)?.[0] ?? '—';
  console.log(`≤${bp}px → ${no}`);
  console.log(`        ${note}`);
}

console.log('\n=== 结论 ===');
const ok =
  prop('.rd-flow', 'display') === 'contents' &&
  counts['rd-row 包裹'] === 0 &&
  counts['rd-no'] === counts['rd-orig'] &&
  counts['rd-orig'] === counts['rd-note'] &&
  prop('.rd-orig', 'grid-column') !== prop('.rd-note', 'grid-column');
console.log(ok ? '三栏定位正确：rd-flow 摊平、无 rd-row 包裹、三元素数量一致、orig 与 note 在不同列' : '存在问题');
