/**
 * 校验构建产物：不得有未求值的 BASE_URL 字面量，所有站内路径必须带 base 前缀。
 * 背景：Astro 里 href="{import.meta.env.BASE_URL}x" 不会求值，
 * 花括号写在引号内会被当普通字符串输出。这条检查专门防这个。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const BASE = '/jiangxiang-school';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const pages = walk(DIST).filter((f) => f.endsWith('.html'));
let bad = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf-8');
  const rel = file.replace(/\\/g, '/');
  const problems = [];

  // 1. 未求值的表达式
  for (const token of ['BASE_URL', 'import.meta.env']) {
    if (html.includes(token)) problems.push(`未求值的 ${token}`);
  }

  // 2. 站内链接缺 base 前缀
  const links = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
  for (const l of new Set(links)) {
    if (!l.startsWith(BASE) && !l.startsWith('/_astro/') === false) {
      // 允许：base 自身前缀的路径
      if (!l.startsWith(BASE)) problems.push(`缺 base 前缀: ${l}`);
    }
  }

  if (problems.length) {
    bad++;
    console.log(`FAIL ${rel}`);
    problems.forEach((p) => console.log(`     ${p}`));
  }
}

if (bad) {
  console.log(`\n${bad} 个页面有问题`);
  process.exit(1);
} else {
  console.log(`${pages.length} 个页面检查通过：无未求值表达式，所有站内链接均带 ${BASE} 前缀`);
}
