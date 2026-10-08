/**
 * IndexNow 推送：部署后通知 Bing / Yandex / DuckDuckGo 等支持 IndexNow 的引擎。
 *
 * IndexNow 需��注册账号，key 是本地随机生成的。协议要求把 key 放在站点根目录，
 * 搜索引擎收到推送后会回访该文件校验真伪 —— 所以 public/indexnow-key.txt 必须
 * 先随部署上线，key 才对得上。
 *
 * 规范：https://www.indexnow.org/documentation
 *
 * 用法：node scripts/indexnow-push.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://readlab-x.github.io';
const BASE = '/jiangxiang-school';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// key 文件路径（.gitignore 忽略，本地保存）
const keyFile = join(ROOT, '.indexnow-key');
if (!existsSync(keyFile)) {
  console.error('缺少 .indexnow-key，无法推送');
  process.exit(0); // 不阻断部署
}
const key = readFileSync(keyFile, 'utf-8').trim();

/** 递归收集 dist 下所有 html，产出线上绝对 URL */
function collect(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collect(p, out);
    else if (name.endsWith('.html')) {
      // dist/index.html → /；dist/yingyao/index.html → /yingyao/
      const rel = p.slice(join(ROOT, 'dist').length).replace(/\\/g, '/');
      const slug = rel.replace(/^\/?/, '/').replace(/index\.html$/, '');
      out.push(ORIGIN + BASE + (slug === '/' ? '/' : slug));
    }
  }
  return out;
}

const distDir = join(ROOT, 'dist');
if (!existsSync(distDir)) {
  console.error('缺少 dist，请先构建');
  process.exit(0);
}

const urls = [...new Set(collect(distDir))].sort();
console.log(`准备推送 ${urls.length} 个 URL：`);
urls.forEach((u) => console.log('  ' + u));

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'readlab-x.github.io',
    // key 必须是站点根目录下的文件名，不是 BASE 子路径
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList: urls,
  }),
});

const text = await res.text();
if (res.ok) {
  console.log(`\n推送成功（HTTP ${res.status}）${text ? ' · ' + text.trim() : ''}`);
} else {
  // 失败不阻断部署：部署已成功，推送可重试
  console.warn(`\n推送返回 HTTP ${res.status}：${text.trim() || '(无响应体)'}`);
  console.warn('不影响部署，可稍后重试或手动在 IndexNow 控制台提交。');
}
