/**
 * 校验 workflow 的 Pages artifact 名。
 *
 * `actions/deploy-pages` 硬编码按名字 `github-pages` 取 artifact，
 * 这个名字不是我们定的，是 deploy-pages 与 upload-pages-artifact 的约定。
 * 一旦给 upload 侧改了名，部署会在 deploy job 直接失败：
 *   No artifacts named "github-pages" were found for this workflow run.
 *
 * 曾经踩过：为了「显式对齐」给 upload 加了 name: pages-artifact，
 * 结果 deploy-pages 找不到 artifact，整个部署挂掉。
 *
 * 这个脚本已接进 CI，防止再犯。
 */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WF = join(ROOT, '.github', 'workflows', 'deploy.yml');

/** deploy-pages 硬编码的名字，不可改 */
const REQUIRED = 'github-pages';

const yml = readFileSync(WF, 'utf-8');
const errors = [];

// upload 侧：name 必须在（缺省也是 github-pages，但显式写出来更清楚）
const upBlock = yml.match(/upload-pages-artifact[^\n]*\n((?:[ \t]+[^\n]*\n)*)/);
if (!upBlock) {
  errors.push('找不到 upload-pages-artifact 步骤');
} else {
  const m = upBlock[1].match(/name:\s*(\S+)/);
  const name = m ? m[1] : REQUIRED; // 未指定时 action 用默认值
  if (name !== REQUIRED) {
    errors.push(`upload-pages-artifact 的 name 是 "${name}"，deploy-pages 只认 "${REQUIRED}"`);
  }
}

// download 侧（indexnow job）：若存在，名字必须与 upload 一致
const dlBlock = yml.match(/download-artifact[^\n]*\n((?:[ \t]+[^\n]*\n)*)/);
if (dlBlock) {
  const m = dlBlock[1].match(/name:\s*(\S+)/);
  if (!m) {
    errors.push('download-artifact 缺 name，会下载全部 artifact');
  } else if (m[1] !== REQUIRED) {
    errors.push(`download-artifact 的 name 是 "${m[1]}"，应与 upload 侧一致（${REQUIRED}）`);
  }
}

// job 依赖：indexnow 必须在 deploy 之后（key 文件要先上线才能被校验）
const jobs = [...yml.matchAll(/^  (\w[\w-]*):$/gm)].map((m) => m[1]);
const idx = yml.indexOf('\n  indexnow:');
const dep = yml.indexOf('\n  deploy:');
if (idx >= 0 && dep >= 0) {
  const section = yml.slice(idx, idx + 200);
  if (!/needs:\s*deploy/.test(section)) {
    errors.push('indexnow job 必须 needs: deploy —— key 文件要先部署才能被搜索引擎校验');
  }
}

if (errors.length) {
  console.error('workflow artifact 配置有问题：');
  for (const e of errors) console.error(`  !! ${e}`);
  console.error(`\ndeploy-pages 约定名固定为 "${REQUIRED}"，不可自定义。`);
  process.exit(1);
}

console.log(`workflow artifact 配置正确（upload / download 均为 "${REQUIRED}"）✓`);
