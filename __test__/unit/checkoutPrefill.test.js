import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, reactive, nextTick } from 'vue';

const replace = vi.fn();
const fetchProducts = vi.fn();
const restoreSession = vi.fn();

const cartStore = reactive({
  items: [{ lineKey: 'line-1' }],
  detailedItems: [{
    lineKey: 'line-1',
    productId: 'product-1',
    variantId: 'variant-1',
    name: 'ZenTab Pro 12',
    image: '',
    variantName: '256 GB',
    color: '',
    quantity: 1,
    price: 649,
    stock: 5,
    unavailable: false,
  }],
  itemCount: 1,
  subtotal: 649,
  discountTotal: 0,
  totalAmount: 649,
  hasUnavailableItems: false,
  increment: vi.fn(),
  removeFromCart: vi.fn(),
  clearCart: vi.fn(),
});

const userStore = reactive({
  currentUser: null,
  restoreSession,
});

vi.mock('@/stores/shop/cart', () => ({
  useCartStore: () => cartStore,
}));

vi.mock('@/stores/shop/products', () => ({
  useProductsStore: () => ({ fetchProducts }),
}));

vi.mock('@/stores/ui/toast', () => ({
  useToastStore: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/stores/auth/user', () => ({
  useUserStore: () => userStore,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/services/orderRequestService', () => ({
  submitOrderRequest: vi.fn(),
}));

const mountCheckout = async () => {
  const Checkout = (await import('@/pages/Checkout/index.vue')).default;
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app = createApp(Checkout);
  app.mount(root);
  await Promise.resolve();
  await nextTick();
  return { app, root };
};

afterEach(() => {
  document.body.innerHTML = '';
  userStore.currentUser = null;
  restoreSession.mockReset().mockResolvedValue(null);
  fetchProducts.mockReset().mockResolvedValue([]);
  replace.mockReset();
});

describe('checkout customer prefill', () => {
  it('keeps guest checkout fields empty', async () => {
    const { app, root } = await mountCheckout();

    expect(root.querySelector('#checkout-first-name').value).toBe('');
    expect(root.querySelector('#email').value).toBe('');
    expect(root.querySelector('#phone').value).toBe('');

    app.unmount();
  });

  it('prefills signed-in customer contact fields without overwriting edits', async () => {
    userStore.currentUser = {
      id: 'customer-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+96170123456',
    };
    restoreSession.mockResolvedValue(userStore.currentUser);

    const { app, root } = await mountCheckout();
    const firstName = root.querySelector('#checkout-first-name');
    const email = root.querySelector('#email');
    const phone = root.querySelector('#phone');

    expect(firstName.value).toBe('Ada');
    expect(email.value).toBe('ada@example.com');
    expect(phone.value).toBe('+96170123456');

    firstName.value = 'Grace';
    firstName.dispatchEvent(new Event('input'));
    await nextTick();
    userStore.currentUser = { ...userStore.currentUser, name: 'Ada L.' };
    await nextTick();

    expect(firstName.value).toBe('Grace');

    app.unmount();
  });
});
