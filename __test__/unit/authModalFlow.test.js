import { createApp, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

const mountAuthModal = async () => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');

  const registerCustomer = vi.fn().mockResolvedValue({
    requiresLogin: true,
    verificationRequired: true,
    message: 'Account created. Please enter the verification code to activate your account.',
    email: 'ada.customer@example.com',
  });
  const resendCustomerVerificationCode = vi.fn();

  vi.doMock('@/services/authService', () => ({
    authService: {
      loginCustomer: vi.fn(),
      loginWithGoogle: vi.fn(),
      registerCustomer,
      verifyCustomer: vi.fn(),
      forgotPassword: vi.fn(),
      resendCustomerVerificationCode,
      logout: vi.fn(),
    },
  }));
  vi.doMock('@/services/googleIdentity', () => ({
    renderGoogleButton: vi.fn(),
  }));

  const AuthModal = (await import('@/components/modals/AuthModal.vue')).default;
  const { useUIStore } = await import('@/stores/ui/ui');

  const pinia = createPinia();
  setActivePinia(pinia);
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app = createApp(AuthModal);
  app.use(pinia);

  useUIStore().authModalOpen = true;
  app.mount(root);
  await nextTick();

  return { app, root, registerCustomer, resendCustomerVerificationCode };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  document.body.innerHTML = '';
});

describe('AuthModal register verification flow', () => {
  it('moves tokenless register success to verification without automatically resending a code', async () => {
    const { app, root, registerCustomer, resendCustomerVerificationCode } = await mountAuthModal();

    [...root.querySelectorAll('button')]
      .find((button) => button.textContent.includes('New customer? Create an account'))
      ?.click();
    await nextTick();
    await setInput(root, '#firstName', 'Ada');
    await setInput(root, '#lastName', 'Customer');
    await setInput(root, '#auth-email', 'Ada.Customer@Example.com');
    await setInput(root, '#auth-phone', '70 123 456');
    await setInput(root, '#auth-password', 'StrongPassw0rd!');
    await setInput(root, '#auth-confirm-password', 'StrongPassw0rd!');

    root.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    await flush();

    expect(registerCustomer).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Ada',
      lastName: 'Customer',
      email: 'Ada.Customer@Example.com',
      phone: '+96170123456',
      password: 'StrongPassw0rd!',
    }));
    expect(resendCustomerVerificationCode).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Verify Account');
    expect(root.textContent).toContain('Account created. Please enter the verification code to activate your account.');

    app.unmount();
  });
});
