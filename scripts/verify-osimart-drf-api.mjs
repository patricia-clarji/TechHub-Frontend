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

const readEndpoint = (name, path, supportsDetail = true) => ({ name, path, supportsDetail, method: 'GET' });
const postEndpoint = (name, path) => ({ name, path, supportsDetail: false, method: 'POST' });

const endpoints = [
  readEndpoint('stores', '/stores/'),
  readEndpoint('customer-info', '/customer-info/'),
  readEndpoint('customer-addresses', '/customer-addresses/'),
  readEndpoint('categories', '/categories/'),
  readEndpoint('collections', '/collections/'),
  readEndpoint('brands', '/brands/'),
  readEndpoint('variant-types', '/variant-types/'),
  readEndpoint('products', '/products/'),
  readEndpoint('product-variants', '/product-variants/'),
  readEndpoint('product-notification-requests', '/product-notification-requests/'),
  readEndpoint('wishlist', '/wishlist/', false),
  readEndpoint('cart-view', '/cart/view/', false),
  postEndpoint('cart-update-item', '/cart/update-item/'),
  readEndpoint('payment-methods', '/payment-methods/'),
  readEndpoint('available-payment-methods', '/available-payment-methods/'),
  readEndpoint('shippingcountries', '/shippingcountries/'),
  readEndpoint('promocodes', '/promocodes/'),
  readEndpoint('freedeliveries', '/freedeliveries/'),
  postEndpoint('checkout', '/checkout/'),
  readEndpoint('order-summaries', '/order-summaries/'),
  postEndpoint('contactmessage', '/contactmessage/'),
  readEndpoint('policies', '/policies/'),
  readEndpoint('banners', '/banners/'),
  readEndpoint('announcementbars', '/announcementbars/'),
  postEndpoint('submitproductrequest', '/submitproductrequest/'),
];

const allowedAuthStatuses = new Set([401, 403]);
const report = [];
const requestTimeoutMs = Number(process.env.OSIMART_SMOKE_TIMEOUT_MS || 8000);

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

const fetchWithTimeout = async (url, options = {}) => fetch(url, {
  ...options,
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(requestTimeoutMs),
});

for (const { name, path, supportsDetail, method } of endpoints) {
  const entry = { name, method, list: { ok: false, status: null, count: 0 }, detail: { skipped: !supportsDetail, ok: false, status: null } };
  try {
    if (method === 'POST') {
      const response = await fetchWithTimeout(buildUrl(path), { method: 'OPTIONS' });
      entry.list.status = response.status;
      entry.list.allow = response.headers.get('allow') || '';
      entry.list.ok = response.ok && entry.list.allow.split(',').map((value) => value.trim().toUpperCase()).includes('POST');
      entry.list.contractOnly = true;
      report.push(entry);
      console.log(`${name}: ${entry.list.ok ? 'ok' : 'failed'} (${entry.list.status}; allow=${entry.list.allow || 'unknown'})`);
      continue;
    }

    const response = await fetchWithTimeout(buildUrl(path, { page_size: '3' }));
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
        const detailResponse = await fetchWithTimeout(buildUrl(`${path}${encodeURIComponent(firstId)}/`));
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
