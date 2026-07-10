import { createApp, nextTick } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from '@/components/layout/Navbar.vue';
import router from '@/router';
import { authSession } from '@/services/authSession';
import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';

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
