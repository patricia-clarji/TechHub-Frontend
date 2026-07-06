import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parseEnv = (source) => Object.fromEntries(
  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const envPath = resolve(process.cwd(), '.env');
const env = existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {};
const baseUrl = (process.env.VITE_OSIMART_BASE_URL || env.VITE_OSIMART_BASE_URL || '').replace(/\/+$/, '');
const storeId = (process.env.VITE_OSIMART_STORE_ID || env.VITE_OSIMART_STORE_ID || '').trim();

if (!baseUrl || !storeId) {
  console.error('Missing VITE_OSIMART_BASE_URL or VITE_OSIMART_STORE_ID.');
  process.exit(1);
}

const endpoints = [
  ['stores', '/stores/', true],
  ['customer-info', '/customer-info/', true],
  ['customer-addresses', '/customer-addresses/', true],
  ['categories', '/categories/', true],
  ['collections', '/collections/', true],
  ['brands', '/brands/', true],
  ['variant-types', '/variant-types/', true],
  ['products', '/products/', true],
  ['product-variants', '/product-variants/', true],
  ['product-notification-requests', '/product-notification-requests/', true],
  ['wishlist', '/wishlist/', false],
  ['cart-view', '/cart/view/', false],
  ['payment-methods', '/payment-methods/', true],
  ['available-payment-methods', '/available-payment-methods/', true],
  ['shippingcountries', '/shippingcountries/', true],
  ['promocodes', '/promocodes/', true],
  ['freedeliveries', '/freedeliveries/', true],
  ['checkout', '/checkout/', true],
  ['order-summaries', '/order-summaries/', true],
  ['contactmessage', '/contactmessage/', false],
  ['policies', '/policies/', true],
  ['banners', '/banners/', true],
  ['announcementbars', '/announcementbars/', true],
  ['submitproductrequest', '/submitproductrequest/', false],
];

const allowedAuthStatuses = new Set([401, 403]);
const report = [];

const buildUrl = (path, params = {}) => {
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.set('store', storeId);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && typeof payload === 'object') return [payload];
  return [];
};

for (const [name, path, supportsDetail] of endpoints) {
  const entry = { name, list: { ok: false, status: null, count: 0 }, detail: { skipped: !supportsDetail, ok: false, status: null } };
  try {
    const response = await fetch(buildUrl(path, { page_size: '3' }), { headers: { Accept: 'application/json' } });
    entry.list.status = response.status;
    if (response.ok) {
      const payload = await response.json();
      const items = extractItems(payload);
      const first = items.find((item) => item && (item.id || item.pk || item.uuid));
      const firstId = first?.id || first?.pk || first?.uuid;
      entry.list.ok = true;
      entry.list.count = items.length;
      entry.list.shape = Array.isArray(payload) ? 'array' : Array.isArray(payload?.results) ? 'paginated' : 'object';

      if (supportsDetail && firstId) {
        const detailResponse = await fetch(buildUrl(`${path}${encodeURIComponent(firstId)}/`), { headers: { Accept: 'application/json' } });
        entry.detail.status = detailResponse.status;
        entry.detail.ok = detailResponse.ok || allowedAuthStatuses.has(detailResponse.status);
      }
    } else {
      entry.list.ok = allowedAuthStatuses.has(response.status);
      entry.list.authRequired = allowedAuthStatuses.has(response.status);
    }
  } catch (error) {
    entry.list.error = error.message;
  }

  report.push(entry);
  const suffix = entry.list.authRequired ? 'auth required' : `${entry.list.count} sampled`;
  console.log(`${name}: ${entry.list.ok ? 'ok' : 'failed'} (${entry.list.status || entry.list.error}; ${suffix})`);
}

const failed = report.filter((entry) => !entry.list.ok || (!entry.detail.skipped && entry.detail.status && !entry.detail.ok));
mkdirSync(resolve(process.cwd(), 'reports'), { recursive: true });
writeFileSync(resolve(process.cwd(), 'reports', 'osimart-api-smoke.json'), JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, endpoints: report }, null, 2));

if (failed.length) {
  console.error('Osimart API smoke check failed. See reports/osimart-api-smoke.json.');
  failed.forEach((entry) => console.error(`- ${entry.name}: list=${entry.list.status || entry.list.error}, detail=${entry.detail.status || 'skipped'}`));
  process.exit(1);
}

console.log('Osimart API smoke check passed. Report written to reports/osimart-api-smoke.json.');
