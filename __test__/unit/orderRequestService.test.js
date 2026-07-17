import { afterEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();

vi.mock('@/services/apiClient', () => ({
  apiClient: { get, post },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  get.mockReset();
  post.mockReset();
});

describe('order request checkout service', () => {
  it('submits the local cart through the Osimart checkout API', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');

    get
      .mockResolvedValueOnce({
        success: true,
        data: {
          results: [{
            id: 'store-payment-1',
            is_cod: true,
            is_active: true,
          }],
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{
          id: 'country-1',
          shipping_zones: [{ id: 'zone-1' }],
        }],
      });
    post.mockResolvedValueOnce({
      success: true,
      data: { id: 'checkout-1' },
    });

    const { submitOrderRequest } = await import('@/services/orderRequestService');
    const result = await submitOrderRequest({
      customer: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+96170123456',
      },
      address: 'Beirut delivery address',
      city: 'Beirut',
      postalCode: '1107',
      notes: 'Call first',
      total: 1298,
      items: [{
        variantId: 'variant-1',
        quantity: 2,
        price: 649,
      }],
    });

    expect(result).toEqual({ id: 'checkout-1' });
    expect(get).toHaveBeenNthCalledWith(1, '/available-payment-methods/', {
      skipAuth: true,
      retries: 0,
    });
    expect(get).toHaveBeenNthCalledWith(2, '/shippingcountries/', {
      skipAuth: true,
      retries: 0,
    });
    expect(post).toHaveBeenCalledWith('/checkout/', {
      payment_method_id: 'store-payment-1',
      cart: {
        'variant-1': { quantity: 2 },
      },
      guest: {
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        phone: '+96170123456',
      },
      address: {
        address: 'Beirut delivery address',
        city: 'Beirut',
        postal_code: '1107',
        country: 'country-1',
        zone: 'zone-1',
      },
      notes: 'Call first',
      total: 1298,
      store_id: 'store-1',
    }, { retries: 0, dedupe: false });
  });

  it('uses a priced product variant when a cart line has no stored variant id', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');

    get
      .mockResolvedValueOnce({
        success: true,
        data: { results: [{ id: 'store-payment-1', is_cod: true, is_active: true }] },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 'country-1', shipping_zones: [{ id: 'zone-1' }] }],
      });
    post.mockResolvedValueOnce({ success: true, data: { id: 'checkout-1' } });

    const { submitOrderRequest } = await import('@/services/orderRequestService');
    await submitOrderRequest({
      customer: { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+96170123456' },
      address: 'Beirut delivery address',
      city: 'Beirut',
      postalCode: '',
      notes: '',
      total: 649,
      items: [{
        variantId: '',
        quantity: 1,
        price: 649,
        product: {
          variants: [
            { id: 'unpriced-variant', price: 0 },
            { id: 'priced-variant', price: 649 },
          ],
        },
      }],
    });

    expect(post.mock.calls[0][1].cart).toEqual({
      'priced-variant': { quantity: 1 },
    });
  });
});
