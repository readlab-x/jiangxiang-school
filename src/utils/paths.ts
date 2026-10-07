/**
 * 子路径部署的链接生成。
 *
 * base（如 /jiangxiang-school）只写在这一个地方。
 * 关键点：BASE_URL 必须在「表达式位置」使用 —— 即整个属性写成
 *   href={withBase('yingyao/')}
 * 而不能写成
 *   href="{import.meta.env.BASE_URL}yingyao/"   ← 花括号在引号内会被当字面量输出
 */
const BASE = import.meta.env.BASE_URL || '/';

/** 站点根路径，例如 /jiangxiang-school/ */
export const baseUrl = (): string => BASE;

/** 站内绝对路径，例如 withBase('yingyao/') → '/jiangxiang-school/yingyao/' */
export const withBase = (path = ''): string => {
  const rel = path.replace(/^\/+/, '');
  return `${BASE}${rel}`;
};
