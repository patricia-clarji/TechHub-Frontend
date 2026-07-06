import { mediaAPI } from '@/services/osimart';

export const normalizeDrfResponse = (payload) => {
  if (Array.isArray(payload)) {
    return { items: payload, count: payload.length, next: null, previous: null, raw: payload };
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.results)) {
      return {
        items: payload.results,
        count: Number(payload.count ?? payload.results.length),
        next: payload.next || null,
        previous: payload.previous || null,
        raw: payload,
      };
    }

    if (Array.isArray(payload.data)) {
      return { items: payload.data, count: payload.data.length, next: null, previous: null, raw: payload };
    }

    return { items: [payload], count: 1, next: null, previous: null, raw: payload };
  }

  return { items: [], count: 0, next: null, previous: null, raw: payload };
};

export const normalizeDrfObject = (payload) => {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) return payload;
  return null;
};

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const toText = (value) => {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(', ');
  if (typeof value === 'object') return toText(firstDefined(value.name, value.title, value.label, value.email, value.code, value.id));
  return String(value);
};

export const getDisplayValue = (record = {}, key) => {
  const value = record[key];
  if (value !== undefined && value !== null && value !== '') return toText(value);

  const fallbacks = {
    name: [record.name, record.title, record.label, record.code, record.order_number, record.email, record.id],
    slug: [record.slugified_name, record.slug, record.code],
    sku: [record.sku, record.product_sku],
    email: [record.email, record.customer?.email, record.user?.email],
    phone: [record.phone, record.mobile_number, record.customer?.mobile_number],
    customer: [record.customer?.name, record.customer_name, record.user?.name, record.email],
    product: [record.product?.name, record.product_name, record.product?.title],
    category: [record.categories?.[0]?.category?.name, record.category?.name, record.category_name],
    brand: [record.brand?.name, record.brand_name],
    price: [record.discounted_price_range, record.price_range, record.price, record.amount],
    stock: [record.remaining_stock, record.stock, record.quantity],
    total: [record.total, record.grand_total, record.order_total, record.amount],
    status: [record.status, record.is_active === false ? 'inactive' : record.is_active === true ? 'active' : ''],
    count: [record.product_count, record.products_count, record.count],
    link: [record.link, record.url, record.redirect_url],
    order: [record.order, record.position, record.sort_order],
    country: [record.country?.name, record.country_name, record.name],
    code: [record.code, record.country_code],
    type: [record.type, record.payment_type, record.method_type],
    discount: [record.discount, record.value, record.amount],
    period: [[record.starts_at, record.ends_at].filter(Boolean).join(' - ')],
  };

  return toText(firstDefined(...(fallbacks[key] || [])));
};

export const getRecordImage = (record = {}) => mediaAPI.getImageUrl(
  firstDefined(record.image, record.logo, record.media, record.thumbnail, record.main_image, record.file)
);

export const normalizeResourceRow = (record = {}, resource, index = 0) => {
  const id = firstDefined(record.id, record.pk, record.uuid, record.slug, record.code, index);
  const status = getDisplayValue(record, 'status') || 'active';
  return {
    id,
    raw: record,
    image: getRecordImage(record),
    status: String(status).toLowerCase().includes('inactive') ? 'inactive' : 'active',
    ...Object.fromEntries((resource.columns || []).map(([key]) => [key, getDisplayValue(record, key)])),
  };
};
