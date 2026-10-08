## 项目

江相派秘本原文站。Astro 静态站，部署在 `readlab-x.github.io/jiangxiang-school/`（子路径）。
内容是晚清民初广东诈骗集团「江相派」的四篇师门秘本，逐段原文 + 译文 + 注解。

## 开发

```sh
npm install
npm run dev
```

Node ≥ 22.12。

## 必须遵守的约定

**子路径部署（base=/jiangxiang-school）**

站内链接一律用 `withBase()`，来自 `src/utils/paths.ts`：

```astro
<a href={withBase('yingyao/')}>        ← 对
<a href="{import.meta.env.BASE_URL}x"> ← 错，花括号在引号内不会求值
```

Astro **只在表达式位置求值**，花括号写在 HTML 属性引号内部会被原样输出，
浏览器把 `{` `}` 编码成 `%7B` `%7D`。改完链接必须看构建产物：
`node scripts/check-base.mjs`（已接 CI）。

**hidden 属性**

`global.css` 开头有 `[hidden] { display: none !important; }` 兜底。
任何组件若给隐藏元素设了 `display: grid/flex`，会顶掉 hidden 的默认 `display: none`。
**新增 tab / 折叠组件后，确认目标元素没有显式 display，或确认兜底规则仍在。**

**秘本原文不可改动**

284 条原文由 `scripts/verify.py` 逐句比对。任何改动原文的操作（合并段落、调整标点、
删除重复）都必须让 verify.py 通过。译文可用 `white-space: pre-line` 支持换行。

**配色**

三色分工：朱红=`--accent`（原文/强调）、靛蓝=`--note`（注解）、赭石=`--mark`（引文标记）。
色值由 `scripts/palette.py` 按 WCAG 对比度与暗色饱和度算出，**不是肉眼调的**。
改色先改那个脚本跑一遍，不要直接写 hex。

暗色不是反色，是**降饱和**：亮→暗饱和度要降 34-45%，否则刺眼。

**组件底色**

卡片型组件统一 `var(--card)`，不要跟所在区块翻转。
区块底色（`--paper`/`--card` 交替）只影响区块本身。

## 提交前必跑

```sh
C:/Users/6iedog/.workbuddy/binaries/python/versions/3.13.12/python.exe scripts/verify.py
node scripts/check-base.mjs
node scripts/check-indexnow.mjs
C:/Users/6iedog/.workbuddy/binaries/python/versions/3.13.12/python.exe scripts/check-en.py
npm run build
```

CI 也会跑 `check-base` 与 `check-indexnow`。

## 依赖陷阱

`package.json` 里的依赖必须与 `package-lock.json` 一致，且 lock 要**跨平台完整**
（含 `@astrojs/compiler-binding-linux-x64-gnu` 等）。
Windows 上 `npm install --package-lock-only` 生成的 lock 会漏掉非本平台的原生包，
Linux CI 上会报 `Cannot find native binding`。

**验证方式**：删 lock → `npm install` → 检查新 lock 是否含目标平台条目。
Windows 本地 `npm ci` 成功不代表 Linux 能过（本地会正确跳过不匹配平台的包）。

## 部署

push 到 `master` 触发 GitHub Actions。仓库 Settings → Pages → Source 需选 GitHub Actions。

IndexNow 的 key 文件在 **host 根域**，由 `readlab-x.github.io` 仓库提供，
改 key 需两仓库同步。本仓库 `public/{key}.txt` 是权威来源。

## 不该进仓库

`.workbuddy/` 是本地工作记忆，已 gitignore。`.vscode/` 有意保留
（`extensions.json` 让协作者自动装 Astro 插件）。
