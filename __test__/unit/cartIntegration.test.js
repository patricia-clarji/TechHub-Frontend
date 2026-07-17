import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();

vi.mock('@/services/apiClient', () => ({
  apiClient: { get, post },
}));

const backendCart = (quantity = 1) => ({
  cart: quantity > 0
    ? {
        'variant-1': {
          id: 'variant-1',
          name: 'AeroBlade 14',
          quantity,
          quantity_step: 1,
          quantity_unit: 'Piece',
          price: '1000.00',
          image: 'static/aeroblade.jpg',
          values: ['14.5"', '16 GB'],
          total_price: quantity * 1000,
          remaining_stock: 3,
          sale: null,
        },
      }
    : {},
  total_price: quantity * 1000,
});

const product = {
  id: 'product-1',
  slug: 'aeroblade-14',
  name: 'AeroBlade 14',
  price: 1000,
  stock: 3,
  inStock: true,
  image: '/aeroblade.jpg',
  category: 'Laptops',
  variants: [{
    id: 'variant-1',
    name: '16 GB / 512 GB',
    price: 1000,
    stock: 3,
  }],
};

beforeEach(() => {
  localStorage.clear();
  get.mockReset();
  post.mockReset();
  setActivePinia(createPinia());
});

describe('Osimart cart API integration', () => {
  it('posts the exact Osimart add-to-cart payload', async () => {
    post.mockResolvedValueOnce({ success: true, data: backendCart(1) });

    const { cartAPI, CART_ACTIONS } = await import('@/services/cartService');
    const result = await cartAPI.updateItem({
      itemId: 'variant-1',
      action: CART_ACTIONS.add,
      quantity: 1,
    });

    expect(result.items[0].variantId).toBe('variant-1');
    expect(post).toHaveBeenCalledWith('/cart/update-item/', {
      item_id: 'variant-1',
      action: 'add',
      quantity: 1,
    }, {
      retries: 0,
      dedupe: false,
    });
  });

  it('adds the first product through the backend cart and syncs local state from the response', async () => {
    post.mockResolvedValueOnce({ success: true, data: backendCart(1) });

    const { useCartStore } = await import('@/stores/shop/cart');
    const cartStore = useCartStore();
    const result = await cartStore.addToCart(product);

    expect(result.success).toBe(true);
    expect(post).toHaveBeenCalledWith('/cart/update-item/', expect.objectContaining({
      item_id: 'variant-1',
      action: 'add',
      quantity: 1,
    }), expect.any(Object));
    expect(cartStore.items).toHaveLength(1);
    expect(cartStore.items[0]).toMatchObject({
      productId: 'product-1',
      variantId: 'variant-1',
      quantity: 1,
      priceSnapshot: 1000,
    });
  });

  it('adds the same product twice through the backend instead of local-only increments', async () => {
    post
      .mockResolvedValueOnce({ success: true, data: backendCart(1) })
      .mockResolvedValueOnce({ success: true, data: backendCart(2) });

    const { useCartStore } = await import('@/stores/shop/cart');
    const cartStore = useCartStore();
    await cartStore.addToCart(product);
    await cartStore.addToCart(product);

    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[1][1]).toMatchObject({
      item_id: 'variant-1',
      action: 'add',
      quantity: 1,
    });
    expect(cartStore.items[0].quantity).toBe(2);
  });

  it('decreases quantity with the supported remove action instead of the broken edit action', async () => {
    post
      .mockResolvedValueOnce({ success: true, data: backendCart(2) })
      .mockResolvedValueOnce({ success: true, data: backendCart(1) });

    const { useCartStore } = await import('@/stores/shop/cart');
    const cartStore = useCartStore();
    await cartStore.addToCart(product, 2);
    await cartStore.setQuantity(cartStore.items[0].lineKey, 1);

    expect(post.mock.calls[1][1]).toMatchObject({
      item_id: 'variant-1',
      action: 'remove',
      quantity: 1,
    });
    expect(post.mock.calls[1][1].action).not.toBe('edit');
    expect(cartStore.items[0].quantity).toBe(1);
  });

  it('removes a line with remove_all', async () => {
    post
      .mockResolvedValueOnce({ success: true, data: backendCart(1) })
      .mockResolvedValueOnce({ success: true, data: backendCart(0) });

    const { useCartStore } = await import('@/stores/shop/cart');
    const cartStore = useCartStore();
    await cartStore.addToCart(product);
    await cartStore.removeFromCart(cartStore.items[0].lineKey);

    expect(post.mock.calls[1][1]).toMatchObject({
      item_id: 'variant-1',
      action: 'remove_all',
    });
    expect(cartStore.items).toEqual([]);
  });

  it('rejects add-to-cart when no real backend variant id is available', async () => {
    const { useCartStore } = await import('@/stores/shop/cart');
    const cartStore = useCartStore();
    const result = await cartStore.addToCart({ ...product, variants: [] });

    expect(result.success).toBe(false);
    expect(result.message).toContain('no purchasable variant');
    expect(post).not.toHaveBeenCalled();
  });

  it('does not fake local success when Osimart rejects the cart update', async () => {
    post.mockResolvedValueOnce({
      success: false,
      error: new Error('No ProductVariant matches the given query.'),
      status: 404,
    });

    const { useCartStore } = await import('@/stores/shop/cart');
    const cartStore = useCartStore();
    const result = await cartStore.addToCart(product);

    expect(result.success).toBe(false);
    expect(result.message).toContain('No ProductVariant');
    expect(cartStore.items).toEqual([]);
  });
});
