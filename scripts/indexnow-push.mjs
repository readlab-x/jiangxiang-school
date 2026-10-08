/**
 * IndexNow 推送：部署后通知 Bing / Yandex / DuckDuckGo 等支持 IndexNow 的引擎。
 *
 * 协议要点（https://www.indexnow.org/documentation）：
 * - key 文件必须命名为 `{key}.txt`，内容就是 key 本身
 * - 走 Option 1：放在 host 根目录。规范明确「strongly recommended」——
 *   若放在子目录（Option 2），该 key 只被认可覆盖同前缀的 URL，
 *   跨前缀的 URL「may not be considered for indexing」
 * - 本站部署在 readlab-x.github.io/jiangxiang-school/ 子路径，
 *   但 host 是 readlab-x.github.io，所以 key 文件必须在根域，
 *   也就是由 readlab-x.github.io 仓库提供
 *
 * 本仓库这一份 public/{key}.txt 是 key 的权威来源（脚本从这里读取）。
 * 根域那份由兄弟仓库 readlab-x.github.io 提供同一内容 —— 两处必须一致，
 * scripts/check-indexnow.mjs 会校验。
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

// key 文件名就是 key 本身（规范要求 {key}.txt）
const keyFileName = readdirSync(join(ROOT, 'public')).find((f) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(f));
if (!keyFileName) {
  console.error('public/ 下找不到 {key}.txt，无法推送');
  process.exit(0); // 不阻断部署
}
const key = keyFileName.replace(/\.txt$/, '');
const content = readFileSync(join(ROOT, 'public', keyFileName), 'utf-8').trim();

if (content !== key) {
  console.error(`key 文件内容与文件名不一致：文件 ${keyFileName}，内容 ${JSON.stringify(content)}`);
  process.exit(1); // 这是配置错误，应该暴露
}

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

/**
 * URL 来源优先用 sitemap —— 那是给搜索引擎的权威清单。
 * 没有 dist（比如 workflow 的独立 job 里）也能工作，
 * 不会出现「构建产物没传过来就静默跳过」的情况。
 */
function urls() {
  const sitemap = join(ROOT, 'dist', 'sitemap-0.xml');
  if (existsSync(sitemap)) {
    const xml = readFileSync(sitemap, 'utf-8');
    const found = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    if (found.length) {
      console.log(`来源: dist/sitemap-0.xml（${found.length} 条）`);
      return [...new Set(found)];
    }
  }

  const distDir = join(ROOT, 'dist');
  if (existsSync(distDir)) {
    const found = [...new Set(collect(distDir))];
    console.log(`来源: 扫描 dist/（${found.length} 条）`);
    return found.sort();
  }

  // 兜底：sitemap 还没有时，按已知页面结构列出。
  // 这是 IndexNow 的 URL 清单，宁可多列也不能漏 —— 多推只是多一次校验请求。
  console.log('来源: 内置页面清单（dist 不可用）');
  return [
    '',
    'yingyao/',
    'junma/',
    'zhafei/',
    'abao/',
    'manuscripts/',
    'mechanism/',
  ].map((s) => ORIGIN + BASE + '/' + s);
}

const list = urls();
console.log(`准备推送 ${list.length} 个 URL：`);
list.forEach((u) => console.log('  ' + u));

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'readlab-x.github.io',
    key,
    // 不传 keyLocation —— 走 Option 1，key 文件在 host 根目录，由 readlab-x.github.io 提供。
    // 传子路径（Option 2）会让 key 只覆盖该前缀下的 URL，跨前缀的会被判定无效。
    urlList: list,
  }),
});

const text = await res.text();

/**
 * 响应码含义（规范）：
 *   200 OK                      → URL 已提交
 *   202 Accepted                → 已收到，key 校验待完成（首推常见）
 *   403 Forbidden               → key 校验不过：key 文件没上线，或内容与文件名不符
 *   422 Unprocessable Entity    → URL 不属于该 host，或 key 不合规范
 *   429 Too Many Requests       → 推送过频
 *
 * 403 是最需要区分的：它说明「key 文件没部署到根域」，
 * 而不是推送内容有问题。
 */
const HINTS = {
  403: [
    `搜索引擎无法验证 key —— 它会去 ${ORIGIN}/${key}.txt 校验。`,
    `请确认 readlab-x.github.io 仓库已部署 public/${key}.txt（内容须与文件名一致）。`,
    '该仓库尚未部署时，任何推送都会被拒。',
  ],
  422: ['URL 不属于 host，或 key 不符合规范（仅 a-zA-Z0-9-，8-128 位）。'],
  429: ['推送过于频繁，稍后重试。'],
};

if (res.ok) {
  console.log(`\n推送成功（HTTP ${res.status}）${text ? ' · ' + text.trim() : ''}`);
  if (res.status === 202) {
    console.log('注意：202 表示 key 校验尚未完成，需等搜索引擎回访 key 文件后才真正生效。');
  }
} else {
  // 推送失败不阻断部署：站点已上线，索引可以下次推送再补
  console.warn(`\n推送返回 HTTP ${res.status}：${text.trim() || '(无响应体)'}`);
  for (const line of HINTS[res.status] ?? []) console.warn(`  → ${line}`);
  console.warn('不影响部署，可稍后重试。');
}
