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
  const forgotPassword = vi.fn().mockResolvedValue({
    email: 'ada.customer@example.com',
    message: 'If an account exists for this email, a reset code has been sent.',
  });
  const resetPassword = vi.fn().mockResolvedValue({
    email: 'ada.customer@example.com',
    message: 'Password reset successfully. Please sign in.',
  });
  const resendCustomerVerificationCode = vi.fn();

  vi.doMock('@/services/authService', () => ({
    authService: {
      loginCustomer: vi.fn(),
      loginWithGoogle: vi.fn(),
      registerCustomer,
      verifyCustomer: vi.fn(),
      forgotPassword,
      resetPassword,
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

  return { app, root, registerCustomer, forgotPassword, resetPassword, resendCustomerVerificationCode };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  document.body.innerHTML = '';
});

describe('AuthModal password reset flow', () => {
  it('moves forgot-password success to reset screen and submits the reset payload', async () => {
    const { app, root, forgotPassword, resetPassword } = await mountAuthModal();

    [...root.querySelectorAll('button')]
      .find((button) => button.textContent.includes('Forgot password?'))
      ?.click();
    await nextTick();
    await setInput(root, '#auth-email', 'Ada.Customer@Example.com');

    root.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    await flush();

    expect(forgotPassword).toHaveBeenCalledWith('Ada.Customer@Example.com');
    expect(root.textContent).toContain('Reset Password');
    expect(root.textContent).toContain('If an account exists for this email, a reset code has been sent.');

    await setInput(root, '#password-reset-code', '1234');
    await setInput(root, '#auth-password', 'NewPassw0rd!');
    await setInput(root, '#auth-confirm-password', 'NewPassw0rd!');

    root.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    await flush();

    expect(resetPassword).toHaveBeenCalledWith({
      email: 'Ada.Customer@Example.com',
      code: '1234',
      password: 'NewPassw0rd!',
    });
    expect(root.textContent).toContain('Sign In');

    app.unmount();
  });
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
