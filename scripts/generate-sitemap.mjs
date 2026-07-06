import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const env = Object.fromEntries(
  (await readFile(resolve('.env'), 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
);

const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '');
const apiUrl = (env.VITE_OSIMART_BASE_URL || 'https://api.osimart.com/store/apis').replace(/\/+$/, '');
const store = env.VITE_OSIMART_STORE_ID;
if (!siteUrl || !/^https:\/\//.test(siteUrl)) throw new Error('Set VITE_SITE_URL to the final HTTPS storefront origin.');
if (!store) throw new Error('Set VITE_OSIMART_STORE_ID before generating the sitemap.');

const load = async (endpoint) => {
  const response = await fetch(`${apiUrl}/${endpoint}/?store=${encodeURIComponent(store)}&page_size=500`);
  if (!response.ok) throw new Error(`Could not load ${endpoint}: HTTP ${response.status}`);
  const payload = await response.json();
  return payload.results || payload.data || payload;
};

const [products, categories] = await Promise.all([load('products'), load('categories')]);
const urls = [
  '/',
  '/products',
  '/deals',
  '/about',
  '/contact',
  '/faq',
  ...categories.filter((item) => !item.unlisted_at && !item.archived_at)
    .map((item) => `/products?category=${encodeURIComponent(item.slugified_name || item.id)}`),
  ...products.filter((item) => !item.unlisted_at && !item.archived_at)
    .map((item) => `/products/${encodeURIComponent(item.slugified_name || item.id)}`),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>${siteUrl}${path.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve('public/sitemap.xml'), xml, 'utf8');
await writeFile(resolve('public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
console.log(`Generated public/sitemap.xml with ${urls.length} URLs.`);
