import { createApp, nextTick } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from '@/components/layout/Navbar.vue';
import router from '@/router';
import { authSession } from '@/services/authSession';
import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';
import { useCartStore } from '@/stores/shop/cart';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useNotificationStore } from '@/stores/ui/notifications';

const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/products', component: { template: '<div>Products</div>' } },
  { path: '/contact', component: { template: '<div>Contact</div>' } },
  { path: '/deals', component: { template: '<div>Deals</div>' } },
  { path: '/about', component: { template: '<div>About</div>' } },
  { path: '/wishlist', component: { template: '<div>Wishlist</div>' } },
  { path: '/account', component: { template: '<div>Account</div>' } },
  { path: '/settings', component: { template: '<div>Settings</div>' } },
];

const mountNavbar = async () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const testRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  });
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app = createApp(Navbar);
  app.use(pinia);
  app.use(testRouter);
  testRouter.push('/');
  await testRouter.isReady();
  app.mount(root);
  await nextTick();
  return { app, root };
};

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  authSession.clear();
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  authSession.clear();
});

describe('account navigation', () => {
  it('shows login/register entry points for guest users', async () => {
    const { app, root } = await mountNavbar();

    expect(root.textContent).toContain('Sign In');
    root.querySelector('nav > button')?.click();
    await nextTick();
    expect(root.textContent).toContain('Sign In / Register');
    expect(root.textContent).not.toContain('Settings');
    expect(root.textContent).not.toContain('Logout');

    app.unmount();
  });

  it('shows profile, settings, logout, and user identity for logged-in users', async () => {
    authSession.set('token-1', { name: 'Demo User', email: 'demo@example.com' });
    const { app, root } = await mountNavbar();

    root.querySelector('button[aria-expanded]')?.click();
    await nextTick();

    expect(root.textContent).toContain('Demo User');
    expect(root.textContent).toContain('demo@example.com');
    expect(root.textContent).toContain('Profile');
    expect(root.textContent).toContain('Settings');
    expect(root.textContent).toContain('Logout');

    app.unmount();
  });

  it('logout returns account navigation to guest state', async () => {
    authSession.set('token-1', { name: 'Demo User', email: 'demo@example.com' });
    const { app, root } = await mountNavbar();

    root.querySelector('button[aria-expanded]')?.click();
    await nextTick();
    [...root.querySelectorAll('button')].find((button) => button.textContent.includes('Logout'))?.click();
    await nextTick();

    expect(root.textContent).toContain('Sign In');
    expect(root.textContent).not.toContain('demo@example.com');

    app.unmount();
  });

  it('logout clears user-scoped local cart, wishlist, and notifications', () => {
    authSession.set('token-1', { name: 'Demo User', email: 'demo@example.com' });
    const pinia = createPinia();
    setActivePinia(pinia);
    const cartStore = useCartStore();
    const wishlistStore = useWishlistStore();
    const notificationStore = useNotificationStore();
    const userStore = useUserStore();

    cartStore.items.push({ lineKey: 'p1::', productId: 'p1', quantity: 1, priceSnapshot: 10, stockSnapshot: 1, name: 'Product' });
    wishlistStore.productIds.push('p1');
    notificationStore.addNotification('Order update', 'order');
    userStore.currentUser = { name: 'Demo User', email: 'demo@example.com' };

    userStore.logout();

    expect(cartStore.items).toEqual([]);
    expect(wishlistStore.productIds).toEqual([]);
    expect(notificationStore.notifications).toEqual([]);
    expect(userStore.isAuthenticated).toBe(false);
  });

  it('keeps wishlist and notifications isolated between signed-in customers', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wishlistStore = useWishlistStore();
    const notificationStore = useNotificationStore();

    authSession.set('token-a', { id: 'customer-a', email: 'a@example.com' });
    wishlistStore.syncOwner();
    notificationStore.syncOwner();
    wishlistStore.toggleWishlist('product-a');
    notificationStore.addNotification('Customer A notice', 'account');

    authSession.set('token-b', { id: 'customer-b', email: 'b@example.com' });
    wishlistStore.syncOwner();
    notificationStore.syncOwner();

    expect(wishlistStore.productIds).toEqual([]);
    expect(notificationStore.notifications).toEqual([]);

    wishlistStore.toggleWishlist('product-b');
    notificationStore.addNotification('Customer B notice', 'account');

    authSession.set('token-a', { id: 'customer-a', email: 'a@example.com' });
    wishlistStore.syncOwner();
    notificationStore.syncOwner();

    expect(wishlistStore.productIds).toEqual(['product-a']);
    expect(notificationStore.notifications).toHaveLength(1);
    expect(notificationStore.notifications[0].message).toBe('Customer A notice');
  });
});

describe('profile and settings route guards', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    authSession.clear();
    await router.push('/');
  });

  it('redirects guest profile access to the storefront with login required', async () => {
    await router.push('/account');

    expect(router.currentRoute.value.name).toBe('Home');
    expect(router.currentRoute.value.query.signIn).toBe('required');
    expect(useUIStore().authModalOpen).toBe(true);
  });

  it('redirects guest settings access to the storefront with login required', async () => {
    await router.push('/settings');

    expect(router.currentRoute.value.name).toBe('Home');
    expect(router.currentRoute.value.query.signIn).toBe('required');
    expect(useUIStore().authModalOpen).toBe(true);
  });

  it('allows logged-in users to access profile and settings routes', async () => {
    const user = { name: 'Demo User', email: 'demo@example.com' };
    authSession.set('token-1', user);
    useUserStore().currentUser = user;

    await router.push('/account');
    expect(router.currentRoute.value.name).toBe('Account');

    await router.push('/settings');
    expect(router.currentRoute.value.name).toBe('Settings');
  });
});
