import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// 部署在 https://readlab-x.github.io/jiangxiang-school/（子路径）
// base 决定资源前缀，trailingSlash: 'always' 保证 /yingyao/ 这类路径
// 带上尾斜杠，与目录式输出匹配
export default defineConfig({
  site: 'https://readlab-x.github.io',
  base: '/jiangxiang-school',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [mdx(), sitemap()],
});
