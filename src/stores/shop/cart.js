import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useProductsStore } from './products';
import { readJson, writeJson } from '@/utils/storage';

const STORAGE_KEY = 'techhub_cart_v2';

const readCart = () => {
  const saved = readJson(localStorage, STORAGE_KEY, []);
  return Array.isArray(saved) ? saved : [];
};

const optionLabel = (option) => {
  if (!option) return '';
  if (typeof option === 'string') return option;
  return option.name || option.label || option.value || option.hex || '';
};

export const useCartStore = defineStore('cart', () => {
  const items = ref(readCart());
  const productsStore = useProductsStore();
  const lastError = ref('');

  const resolveProduct = (productOrId) => (
    typeof productOrId === 'object'
      ? productOrId
      : productsStore.products.find((product) => String(product.id) === String(productOrId))
  );

  const detailedItems = computed(() => items.value.map((line) => {
    const liveProduct = resolveProduct(line.productId);
    const liveVariant = liveProduct?.variants?.find((variant) => String(variant.id) === String(line.variantId));
    const stock = Number(liveVariant?.stock ?? liveProduct?.stock ?? line.stockSnapshot ?? 0);
    return {
      ...line,
      product: liveProduct || null,
      name: liveProduct?.name || line.name || 'Unavailable product',
      image: liveProduct?.image || line.image || '',
      category: liveProduct?.category || line.category || '',
      price: Number(line.priceSnapshot || 0),
      stock,
      unavailable: !liveProduct,
    };
  }));

  const addToCart = (productOrId, quantity = 1, options = {}) => {
    lastError.value = '';
    const product = resolveProduct(productOrId);
    if (!product) {
      lastError.value = 'This product is no longer available.';
      return { success: false, message: lastError.value };
    }

    const variant = options.variant || null;
    const stock = Number(variant?.stock ?? product.stock ?? 0);
    if (!product.inStock || stock <= 0) {
      lastError.value = 'This item is currently out of stock.';
      return { success: false, message: lastError.value };
    }

    const requested = Math.max(1, Number(quantity) || 1);
    const variantId = variant?.id ? String(variant.id) : '';
    const color = optionLabel(options.color);
    const lineKey = `${product.id}:${variantId}:${color}`;
    const existing = items.value.find((line) => line.lineKey === lineKey);
    const nextQuantity = Math.min(stock, (existing?.quantity || 0) + requested);
    if (existing && nextQuantity === existing.quantity) {
      lastError.value = `Only ${stock} item${stock === 1 ? '' : 's'} available.`;
      return { success: false, message: lastError.value };
    }

    const price = Number(variant?.price ?? product.price ?? 0);
    if (existing) {
      existing.quantity = nextQuantity;
      existing.stockSnapshot = stock;
    } else {
      items.value.push({
        lineKey,
        productId: String(product.id),
        slug: product.slug || '',
        variantId,
        variantName: optionLabel(variant),
        color,
        quantity: Math.min(requested, stock),
        priceSnapshot: price,
        stockSnapshot: stock,
        name: product.name,
        image: product.image || product.img || '',
        category: product.category || '',
      });
    }
    return { success: true };
  };

  const setQuantity = (lineKey, quantity) => {
    const line = items.value.find((item) => item.lineKey === lineKey);
    if (!line) return;
    const detail = detailedItems.value.find((item) => item.lineKey === lineKey);
    const stock = Math.max(0, detail?.stock || 0);
    line.quantity = Math.max(1, Math.min(Number(quantity) || 1, stock));
  };

  const increment = (lineKey, amount) => {
    const line = items.value.find((item) => item.lineKey === lineKey);
    if (line) setQuantity(lineKey, line.quantity + amount);
  };

  const removeFromCart = (lineKey) => {
    items.value = items.value.filter((item) => item.lineKey !== lineKey && item.productId !== String(lineKey));
  };

  const clearCart = () => { items.value = []; };
  const subtotal = computed(() => detailedItems.value.reduce((total, item) => total + item.price * item.quantity, 0));
  const discountTotal = computed(() => 0);
  const totalAmount = computed(() => subtotal.value);
  const itemCount = computed(() => items.value.reduce((total, item) => total + item.quantity, 0));
  const hasUnavailableItems = computed(() => detailedItems.value.some((item) => item.unavailable || item.stock < item.quantity));

  watch(items, (value) => {
    writeJson(localStorage, STORAGE_KEY, value);
  }, { deep: true });

  try { localStorage.removeItem('cart_items'); } catch { /* Storage may be unavailable. */ }

  return {
    items,
    detailedItems,
    lastError,
    addToCart,
    setQuantity,
    increment,
    removeFromCart,
    clearCart,
    subtotal,
    discountTotal,
    totalAmount,
    itemCount,
    hasUnavailableItems,
  };
});
