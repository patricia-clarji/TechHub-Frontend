import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useProductsStore } from './products';
import {
  CART_ACTIONS,
  GUEST_CART_OWNER,
  buildCartLine,
  cartAPI,
  clearLegacyCartStorage,
  clearLocalCart,
  getCartOwner,
  readLocalCart,
  writeLocalCart,
} from '@/services/cartService';

const optionLabel = (option) => {
  if (!option) return '';
  if (typeof option === 'string') return option;
  return option.name || option.label || option.value || option.hex || '';
};

export const useCartStore = defineStore('cart', () => {
  const owner = ref(getCartOwner());
  const items = ref(readLocalCart(owner.value));
  const productsStore = useProductsStore();
  const lastError = ref('');
  const loading = ref(false);
  const lastBackendCart = ref(null);

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

  const findProductByVariant = (variantId) => productsStore.products.find((product) => (
    Array.isArray(product.variants) &&
    product.variants.some((variant) => String(variant.id) === String(variantId))
  ));

  const selectVariant = (product, requestedVariant) => {
    if (requestedVariant?.id) return requestedVariant;
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return variants.find((variant) => Number(variant.stock ?? product.stock ?? 0) > 0 && Number(variant.price ?? product.price ?? 0) > 0)
      || variants.find((variant) => variant.id && Number(variant.stock ?? product.stock ?? 0) > 0)
      || null;
  };

  const mapBackendLine = (backendLine, fallback = {}) => {
    const product = fallback.product || findProductByVariant(backendLine.variantId);
    const variant = fallback.variant || product?.variants?.find((item) => String(item.id) === String(backendLine.variantId)) || null;
    const color = fallback.color || '';
    const line = product
      ? buildCartLine({ product, quantity: backendLine.quantity, variant, color })
      : {
          lineKey: `${backendLine.variantId}:${backendLine.variantId}:`,
          productId: String(backendLine.variantId),
          slug: '',
          variantId: backendLine.variantId,
          variantName: backendLine.values.join(' / '),
          color: '',
          quantity: backendLine.quantity,
          priceSnapshot: backendLine.price,
          stockSnapshot: backendLine.remainingStock,
          name: backendLine.name,
          image: backendLine.image,
          category: '',
        };

    return {
      ...line,
      backendItemId: backendLine.backendItemId,
      variantId: backendLine.variantId,
      variantName: line.variantName || backendLine.values.join(' / '),
      quantity: backendLine.quantity,
      priceSnapshot: backendLine.price,
      stockSnapshot: backendLine.remainingStock,
      name: product?.name || backendLine.name,
      image: product?.image || product?.img || backendLine.image,
    };
  };

  const applyBackendCart = (backendCart, fallback = {}) => {
    lastBackendCart.value = backendCart;
    items.value = backendCart.items
      .filter((backendLine) => backendLine.quantity > 0)
      .map((backendLine) => mapBackendLine(backendLine, fallback));
  };

  const errorMessage = (error, fallback = 'Unable to update your cart. Please try again.') => (
    error?.message || error?.detail || fallback
  );

  const mergeLines = (baseLines = [], incomingLines = []) => {
    const merged = new Map();
    [...baseLines, ...incomingLines].forEach((line) => {
      if (!line?.lineKey) return;
      const current = merged.get(line.lineKey);
      if (!current) {
        merged.set(line.lineKey, { ...line });
        return;
      }
      const stock = Math.max(Number(current.stockSnapshot) || 0, Number(line.stockSnapshot) || 0);
      const quantity = (Number(current.quantity) || 0) + (Number(line.quantity) || 0);
      merged.set(line.lineKey, {
        ...current,
        ...line,
        quantity: stock > 0 ? Math.min(quantity, stock) : quantity,
        stockSnapshot: stock || current.stockSnapshot || line.stockSnapshot,
      });
    });
    return [...merged.values()];
  };

  const syncOwner = ({ mergeGuest = false } = {}) => {
    const nextOwner = getCartOwner();
    if (nextOwner === owner.value && !mergeGuest) return items.value;

    const currentOwner = owner.value;
    const currentItems = [...items.value];
    writeLocalCart(currentItems, currentOwner);

    if (mergeGuest && nextOwner !== GUEST_CART_OWNER) {
      const guestItems = currentOwner === GUEST_CART_OWNER ? currentItems : readLocalCart(GUEST_CART_OWNER);
      const customerItems = readLocalCart(nextOwner);
      const merged = mergeLines(customerItems, guestItems);
      owner.value = nextOwner;
      items.value = merged;
      writeLocalCart(merged, nextOwner);
      clearLocalCart(GUEST_CART_OWNER);
      return items.value;
    }

    owner.value = nextOwner;
    items.value = readLocalCart(nextOwner);
    return items.value;
  };

  const addToCart = async (productOrId, quantity = 1, options = {}) => {
    lastError.value = '';
    const product = resolveProduct(productOrId);
    if (!product) {
      lastError.value = 'This product is no longer available.';
      return { success: false, message: lastError.value };
    }

    const variant = selectVariant(product, options.variant);
    if (!variant?.id) {
      lastError.value = 'This item cannot be added because no purchasable variant is available.';
      return { success: false, message: lastError.value };
    }

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

    loading.value = true;
    try {
      const backendCart = await cartAPI.updateItem({
        itemId: variantId,
        action: CART_ACTIONS.add,
        quantity: requested,
      });
      applyBackendCart(backendCart, { product, variant, color });
      return { success: true, cart: backendCart };
    } catch (error) {
      lastError.value = errorMessage(error);
      return { success: false, message: lastError.value };
    } finally {
      loading.value = false;
    }
  };

  const setQuantity = async (lineKey, quantity) => {
    lastError.value = '';
    const line = items.value.find((item) => item.lineKey === lineKey);
    if (!line) return { success: false, message: 'Cart item not found.' };
    const detail = detailedItems.value.find((item) => item.lineKey === lineKey);
    const stock = Math.max(0, detail?.stock || 0);
    const nextQuantity = Math.max(0, Math.min(Number(quantity) || 0, stock));
    if (nextQuantity === 0) return removeFromCart(lineKey);
    const delta = nextQuantity - line.quantity;
    if (delta === 0) return { success: true };

    loading.value = true;
    try {
      const backendCart = await cartAPI.updateItem({
        itemId: line.variantId || line.backendItemId,
        action: delta > 0 ? CART_ACTIONS.add : CART_ACTIONS.remove,
        quantity: Math.abs(delta),
      });
      applyBackendCart(backendCart);
      return { success: true, cart: backendCart };
    } catch (error) {
      lastError.value = errorMessage(error);
      return { success: false, message: lastError.value };
    } finally {
      loading.value = false;
    }
  };

  const increment = async (lineKey, amount) => {
    const line = items.value.find((item) => item.lineKey === lineKey);
    if (!line) return { success: false, message: 'Cart item not found.' };
    return setQuantity(lineKey, line.quantity + amount);
  };

  const removeFromCart = async (lineKey) => {
    lastError.value = '';
    const line = items.value.find((item) => item.lineKey === lineKey || item.productId === String(lineKey));
    if (!line) return { success: false, message: 'Cart item not found.' };

    loading.value = true;
    try {
      const backendCart = await cartAPI.updateItem({
        itemId: line.variantId || line.backendItemId,
        action: CART_ACTIONS.removeAll,
      });
      applyBackendCart(backendCart);
      return { success: true, cart: backendCart };
    } catch (error) {
      lastError.value = errorMessage(error);
      return { success: false, message: lastError.value };
    } finally {
      loading.value = false;
    }
  };

  const clearCart = (targetOwner = owner.value) => {
    if (targetOwner === owner.value) items.value = [];
    clearLocalCart(targetOwner);
    lastBackendCart.value = null;
  };

  const fetchBackendCart = async () => {
    lastError.value = '';
    loading.value = true;
    try {
      const backendCart = await cartAPI.view();
      applyBackendCart(backendCart);
      return { success: true, cart: backendCart };
    } catch (error) {
      lastError.value = errorMessage(error, 'Unable to load your cart.');
      return { success: false, message: lastError.value };
    } finally {
      loading.value = false;
    }
  };

  const subtotal = computed(() => detailedItems.value.reduce((total, item) => total + item.price * item.quantity, 0));
  const discountTotal = computed(() => 0);
  const totalAmount = computed(() => subtotal.value);
  const itemCount = computed(() => items.value.reduce((total, item) => total + item.quantity, 0));
  const hasUnavailableItems = computed(() => detailedItems.value.some((item) => item.unavailable || item.stock < item.quantity));

  watch(items, (value) => {
    writeLocalCart(value, owner.value);
  }, { deep: true });

  clearLegacyCartStorage();

  return {
    items,
    detailedItems,
    lastError,
    loading,
    lastBackendCart,
    owner,
    syncOwner,
    addToCart,
    setQuantity,
    increment,
    removeFromCart,
    clearCart,
    fetchBackendCart,
    subtotal,
    discountTotal,
    totalAmount,
    itemCount,
    hasUnavailableItems,
  };
});
