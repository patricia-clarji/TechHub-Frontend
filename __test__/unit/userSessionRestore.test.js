import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authSession } from '@/services/authSession';

const refreshSession = vi.fn();
const hasRecoverableSession = vi.fn();
const logout = vi.fn();

vi.mock('@/services/authService', () => ({
  authService: {
    hasRecoverableSession,
    refreshSession,
    logout,
    loginCustomer: vi.fn(),
    loginWithGoogle: vi.fn(),
    registerCustomer: vi.fn(),
    verifyCustomer: vi.fn(),
    forgotPassword: vi.fn(),
    resendCustomerVerificationCode: vi.fn(),
  },
}));

describe('user session restoration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    authSession.clear();
    refreshSession.mockReset();
    hasRecoverableSession.mockReset();
    logout.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    authSession.clear();
  });

  it('restores the current user from a recoverable refresh session', async () => {
    hasRecoverableSession.mockReturnValue(true);
    const user = { id: 'customer-1', email: 'ada@example.com', name: 'Ada Customer' };
    refreshSession.mockImplementation(async () => {
      authSession.set('restored-token', user, 'refresh-token');
      return user;
    });
    const { useUserStore } = await import('@/stores/auth/user');
    const store = useUserStore();

    await store.restoreSession();

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated).toBe(true);
    expect(store.currentUser).toMatchObject({ email: 'ada@example.com', name: 'Ada Customer' });
    expect(store.hasInitialized).toBe(true);
    expect(store.isInitializing).toBe(false);
  });

  it('continues as guest when refresh restoration fails', async () => {
    hasRecoverableSession.mockReturnValue(true);
    refreshSession.mockRejectedValue(new Error('expired refresh'));
    const { useUserStore } = await import('@/stores/auth/user');
    const store = useUserStore();

    await store.restoreSession();

    expect(store.isAuthenticated).toBe(false);
    expect(store.currentUser).toBeNull();
    expect(store.hasInitialized).toBe(true);
  });

  it('does not call refresh when no recoverable session exists', async () => {
    hasRecoverableSession.mockReturnValue(false);
    const { useUserStore } = await import('@/stores/auth/user');
    const store = useUserStore();

    await store.restoreSession();

    expect(refreshSession).not.toHaveBeenCalled();
    expect(store.isAuthenticated).toBe(false);
  });
});
