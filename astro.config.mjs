import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jiangxiang-school.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
});
