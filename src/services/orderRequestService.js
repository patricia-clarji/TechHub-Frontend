import { apiClient } from './apiClient';
import config from '@/config';
import { createApiError } from '@/services/errorHandler';

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === 'object') return [payload];
  return [];
};

const getCheckoutPaymentMethodId = async () => {
  const response = await apiClient.get('/available-payment-methods/', {
    skipAuth: true,
    retries: 0,
  });
  if (!response.success) throw response.error;

  const paymentMethod = extractList(response.data).find((method) => method?.is_cod && method?.is_active)
    || extractList(response.data).find((method) => method?.is_active)
    || extractList(response.data)[0];

  if (!paymentMethod?.id) {
    throw createApiError({ message: 'Cash on Delivery is not available for this store.' });
  }

  return paymentMethod.id;
};

const getCheckoutAddressDefaults = async () => {
  const response = await apiClient.get('/shippingcountries/', {
    skipAuth: true,
    retries: 0,
  });
  if (!response.success) throw response.error;

  const country = extractList(response.data)[0];
  const zone = Array.isArray(country?.shipping_zones) ? country.shipping_zones[0] : null;

  if (!country?.id) {
    throw createApiError({ message: 'No delivery country is configured for this store.' });
  }
  if (!zone?.id) {
    throw createApiError({ message: 'No delivery zone is configured for this store.' });
  }

  return {
    country: country.id,
    zone: zone.id,
  };
};

const isPricedVariant = (variant) => Number.isFinite(Number(variant?.price)) && Number(variant.price) > 0;

const getLineCheckoutItemId = (item) => {
  const variants = Array.isArray(item.product?.variants) ? item.product.variants : [];
  const selectedVariant = variants.find((variant) => String(variant.id) === String(item.variantId));
  if (selectedVariant && isPricedVariant(selectedVariant)) return selectedVariant.id;

  if (item.variantId && !variants.length) return item.variantId;

  const priceMatchedVariant = variants.find((variant) => (
    isPricedVariant(variant) && Number(variant.price) === Number(item.price)
  ));
  if (priceMatchedVariant?.id) return priceMatchedVariant.id;

  const firstPricedVariant = variants.find(isPricedVariant);
  return firstPricedVariant?.id || '';
};

const buildCheckoutCart = (items) => {
  const cart = {};

  items.forEach((item) => {
    const itemId = getLineCheckoutItemId(item);
    if (!itemId) return;
    cart[itemId] = {
      quantity: Number(item.quantity) || 1,
    };
  });

  if (!Object.keys(cart).length) {
    throw createApiError({ message: 'Unable to prepare checkout items. Please refresh your cart and try again.' });
  }

  return cart;
};

export const submitOrderRequest = async ({ customer, address, city = '', postalCode = '', notes, items, total }) => {
  const [firstName, ...lastNameParts] = customer.name.trim().split(/\s+/);
  const [paymentMethodId, addressDefaults] = await Promise.all([
    getCheckoutPaymentMethodId(),
    getCheckoutAddressDefaults(),
  ]);

  const response = await apiClient.post('/checkout/', {
    payment_method_id: paymentMethodId,
    cart: buildCheckoutCart(items),
    guest: {
      first_name: firstName,
      last_name: lastNameParts.join(' ') || '-',
      email: customer.email.trim(),
      phone: customer.phone.trim(),
    },
    address: {
      address,
      city: city.trim() || undefined,
      postal_code: postalCode.trim() || undefined,
      country: addressDefaults.country,
      zone: addressDefaults.zone,
    },
    notes: notes || '',
    total,
    store_id: config.API.STORE_ID,
  }, { retries: 0, dedupe: false });

  if (!response.success) throw response.error;
  return response.data;
};
