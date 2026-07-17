import { createApp, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authSession } from '@/services/authSession';

const changePassword = vi.fn();

vi.mock('@/services/authService', () => ({
  authService: {
    changePassword,
    logout: vi.fn(),
    hasRecoverableSession: vi.fn(() => false),
    refreshSession: vi.fn(),
  },
}));

const flush = async () => {
  await Promise.resolve();
  await nextTick();
};

const setInput = async (root, selector, value) => {
  const input = root.querySelector(selector);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await nextTick();
};

const mountSettings = async () => {
  const Settings = (await import('@/pages/Settings/index.vue')).default;
  const { useUserStore } = await import('@/stores/auth/user');
  const pinia = createPinia();
  setActivePinia(pinia);
  authSession.set('access-token', { email: 'ada@example.com', name: 'Ada Customer' });
  useUserStore().currentUser = { email: 'ada@example.com', name: 'Ada Customer' };
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app = createApp(Settings);
  app.use(pinia);
  app.mount(root);
  await nextTick();
  return { app, root };
};

afterEach(() => {
  vi.restoreAllMocks();
  changePassword.mockReset();
  authSession.clear();
  document.body.innerHTML = '';
});

describe('Settings password change', () => {
  it('submits old and new passwords through the auth store', async () => {
    changePassword.mockResolvedValue({ message: 'Password changed successfully.' });
    const { app, root } = await mountSettings();

    [...root.querySelectorAll('button')].find((button) => button.textContent.includes('Security'))?.click();
    await nextTick();
    await setInput(root, '#settings-old-password', 'OldPassw0rd!');
    await setInput(root, '#settings-new-password', 'NewPassw0rd!');
    await setInput(root, '#settings-confirm-password', 'NewPassw0rd!');
    root.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    await flush();

    expect(changePassword).toHaveBeenCalledWith({
      oldPassword: 'OldPassw0rd!',
      newPassword: 'NewPassw0rd!',
    });
    expect(root.textContent).toContain('Password changed successfully.');

    app.unmount();
  });

  it('blocks mismatched confirmation before calling the backend', async () => {
    const { app, root } = await mountSettings();

    [...root.querySelectorAll('button')].find((button) => button.textContent.includes('Security'))?.click();
    await nextTick();
    await setInput(root, '#settings-old-password', 'OldPassw0rd!');
    await setInput(root, '#settings-new-password', 'NewPassw0rd!');
    await setInput(root, '#settings-confirm-password', 'DifferentPassw0rd!');
    root.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();

    expect(changePassword).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Passwords do not match.');

    app.unmount();
  });
});
