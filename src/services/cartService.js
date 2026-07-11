import { authSession } from '@/services/authSession';
import { readJson, writeJson } from '@/utils/storage';

export const CART_BACKEND_AVAILABLE = false;
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
