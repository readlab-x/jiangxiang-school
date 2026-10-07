import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site, base }) => {
  const origin = (site?.toString() ?? 'https://readlab-x.github.io').replace(/\/$/, '');
  // 静态输出时 base 可能为 undefined，回退到构建配置里读
  const prefix = (base ?? import.meta.env.BASE_URL ?? '/jiangxiang-school').replace(/\/$/, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}${prefix}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
