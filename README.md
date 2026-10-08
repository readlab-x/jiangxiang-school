# 江相派 · 江湖上的宰相

晚清民初活跃于广东的诈骗集团官网。收录江相派师门秘本原文，逐段译文与注解，并拆解其行骗机制。

**线上**：https://readlab-x.github.io/jiangxiang-school/

## 内容

| 页面 | 内容 |
|---|---|
| `/` | 总览：七步流水线、六字真言、掌门谱系、机制拆解 |
| `/yingyao/` | 英耀篇 · 56 段，看相话术手册 |
| `/junma/` | 军马篇 · 217 段，选目标与下手的流程 |
| `/zhafei/` | 扎飞篇 · 装神弄鬼的基本道理 |
| `/abao/` | 阿宝篇 · 戒律与变现原则 |
| `/mechanism/` | 骗局机制 · 为什么这些话术有效 |
| `/manuscripts/` | 四篇总览、史料分歧与来源说明 |

## 文本来源

秘本原文依据公开流传的抄本与百科条目记载整理，**非从小说或影视改编中摘录**。
各来源对四篇地位的表述存在冲突，站内如实记录分歧，不掩盖史料的不确定性。

站内另有电视剧《我不是大师》与小说《我是个算命先生》的关联说明——
两者均取材于这一历史组织，但**属改编，非史料**。

## 开发

```sh
npm install
npm run dev        # 开发服务器
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

Node ≥ 22.12。

## 校验脚本

内容改动后跑这几项，CI 也会执行：

| 脚本 | 检查什么 |
|---|---|
| `node scripts/verify.py` | 284 条秘本原文逐句比对，防误删改 |
| `node scripts/check-base.mjs` | 子路径部署的链接前缀，防 `BASE_URL` 未求值回归 |
| `node scripts/check-indexnow.mjs` | IndexNow 推送清单与实际页面一致、key 文件规范 |
| `node scripts/check-en.py` | 中文内容里的英文残留 |
| `node scripts/verify-layout.mjs` | 秘本页三栏定位 |
| `node scripts/palette.py` | 配色对比度与暗色饱和度 |

图标与 OG 卡由 `scripts/og-gen.mjs`、`scripts/ico-gen.mjs` 从 `public/favicon.svg` 生成，改 SVG 后跑一遍即可同步。

## 部署

GitHub Actions 推 `master` 分支自动部署到 GitHub Pages（子路径 `/jiangxiang-school/`）。
仓库 **Settings → Pages → Source** 需选 **GitHub Actions**。

部署后触发 IndexNow 推送，通知 Bing / Yandex / DuckDuckGo。
**key 文件在 host 根域**，由 `readlab-x.github.io` 仓库提供，改 key 需两仓库同步
（`readlab-x.github.io/scripts-check-indexnow-key.mjs` 校验一致性）。

## 配色

双色分工：朱红=原文/强调，靛蓝=注解，赭石=引文标记。色值由 `scripts/palette.py`
按 WCAG 对比度与暗色饱和度要求计算得出，非肉眼调整。**改色先跑这个脚本。**

支持亮色 / 暗色 / 跟随系统，默认跟随系统。

## 许可

代码 MIT。秘本原文为公有领域材料，本站仅作整理注解。
