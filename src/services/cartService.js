import { authSession } from '@/services/authSession';
import { apiClient } from '@/services/apiClient';
import { readJson, writeJson } from '@/utils/storage';

export const CART_BACKEND_AVAILABLE = true;
export const GUEST_CART_OWNER = 'guest';

const CART_STORAGE_PREFIX = 'techhub_cart_v3';
const LEGACY_CART_KEYS = ['techhub_cart_v2', 'cart_items'];

export const getCartOwner = () => {
  const user = authSession.getUser();
  const id = user?.id || user?.email;
  return id ? `customer:${String(id)}` : GUEST_CART_OWNER;
};

export const cartStorageKey = (owner = getCartOwner()) => `${CART_STORAGE_PREFIX}:${owner}`;

export const readLocalCart = (owner = getCartOwner()) => {
  const saved = readJson(localStorage, cartStorageKey(owner), []);
  return Array.isArray(saved) ? saved : [];
};

export const writeLocalCart = (items, owner = getCartOwner()) => {
  writeJson(localStorage, cartStorageKey(owner), Array.isArray(items) ? items : []);
};

export const clearLocalCart = (owner = getCartOwner()) => {
  writeLocalCart([], owner);
};

export const clearLegacyCartStorage = () => {
  for (const key of LEGACY_CART_KEYS) {
    try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
  }
};

export const buildCartLine = ({ product, quantity, variant = null, color = '' }) => {
  const variantId = variant?.id ? String(variant.id) : '';
  const lineKey = `${product.id}:${variantId}:${color}`;
  const stock = Number(variant?.stock ?? product.stock ?? 0);
  const price = Number(variant?.price ?? product.price ?? 0);

  return {
    lineKey,
    productId: String(product.id),
    slug: product.slug || '',
    variantId,
    variantName: variant?.name || variant?.label || variant?.value || variant?.sku || '',
    color,
    quantity: Math.min(Math.max(1, Number(quantity) || 1), Math.max(0, stock)),
    priceSnapshot: price,
    stockSnapshot: stock,
    name: product.name,
    image: product.image || product.img || '',
    category: product.category || '',
  };
};

export const createCartIdempotencyKey = () => (
  globalThis.crypto?.randomUUID?.() || `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

export const CART_ENDPOINTS = Object.freeze({
  view: '/cart/view/',
  updateItem: '/cart/update-item/',
});

export const CART_ACTIONS = Object.freeze({
  add: 'add',
  remove: 'remove',
  removeAll: 'remove_all',
});

export const normalizeBackendCart = (payload = {}) => {
  const cart = payload?.cart && typeof payload.cart === 'object' ? payload.cart : {};
  return {
    items: Object.entries(cart).map(([variantId, item]) => ({
      backendItemId: String(item?.id || variantId),
      variantId: String(item?.id || variantId),
      name: item?.name || 'Cart item',
      quantity: Math.max(0, Number(item?.quantity) || 0),
      quantityStep: Number(item?.quantity_step) || 1,
      quantityUnit: item?.quantity_unit || '',
      price: Number(item?.price) || 0,
      image: item?.image || '',
      values: Array.isArray(item?.values) ? item.values : [],
      totalPrice: Number(item?.total_price) || 0,
      remainingStock: Number(item?.remaining_stock) || 0,
      sale: item?.sale || null,
      raw: item,
    })),
    totalPrice: Number(payload?.total_price) || 0,
    raw: payload,
  };
};

export const cartAPI = {
  view: async () => {
    const response = await apiClient.get(CART_ENDPOINTS.view, {
      retries: 0,
      dedupe: false,
    });
    if (!response.success) throw response.error;
    return normalizeBackendCart(response.data);
  },

  updateItem: async ({ itemId, action, quantity }) => {
    const payload = {
      item_id: String(itemId || ''),
      action,
    };
    if (quantity !== undefined) payload.quantity = Math.max(0, Number(quantity) || 0);

    const response = await apiClient.post(CART_ENDPOINTS.updateItem, payload, {
      retries: 0,
      dedupe: false,
    });
    if (!response.success) throw response.error;
    return normalizeBackendCart(response.data);
  },
};
