import { afterEach, describe, expect, it, vi } from 'vitest';

const loadAuthService = async (post = vi.fn()) => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_OSIMART_AUTH_URL', 'https://api.example.test/auth');
  vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');
  localStorage.clear();

  vi.doMock('axios', () => ({
    default: {
      create: vi.fn(() => ({ post })),
    },
  }));

  return import('@/services/authService');
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  localStorage.clear();
});

describe('authService login', () => {
  it('posts the real Osimart customer login payload and stores the returned token in memory', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'header.payload.signature',
        user: { id: 'customer-1', email: 'admin@example.com', first_name: 'Ada', last_name: 'Admin' },
      },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    const user = await authService.login(' Admin@Example.com ', 'secret');

    expect(post).toHaveBeenCalledWith('/login/', expect.objectContaining({
      login_as: 'customer',
      email: 'admin@example.com',
      password: 'secret',
      device_name: expect.stringContaining('TechHub web'),
      device_id: expect.any(String),
      store_id: 'store-1',
    }));
    expect(user).toMatchObject({ id: 'customer-1', email: 'admin@example.com', name: 'Ada Admin' });
    expect(authSession.getToken()).toBe('header.payload.signature');
  });

  it('retries once with custmer when customer login is rejected by the backend', async () => {
    const post = vi.fn()
      .mockRejectedValueOnce({ response: { status: 400, data: { non_field_errors: ['Invalid user.'] } } })
      .mockResolvedValueOnce({
        data: {
          token: 'fallback-token',
          customer: { id: 'customer-2', email: 'admin@example.com', first_name: 'Fallback' },
        },
      });
    const { authService } = await loadAuthService(post);

    const user = await authService.login('admin@example.com', 'secret');

    expect(post).toHaveBeenNthCalledWith(1, '/login/', expect.objectContaining({ login_as: 'customer' }));
    expect(post).toHaveBeenNthCalledWith(2, '/login/', expect.objectContaining({ login_as: 'custmer' }));
    expect(user).toMatchObject({ id: 'customer-2', email: 'admin@example.com', name: 'Fallback' });
  });

  it('surfaces failed login responses without faking success', async () => {
    const post = vi.fn()
      .mockRejectedValueOnce({ response: { status: 401, data: { detail: 'No active account found.' } } })
      .mockRejectedValueOnce({ response: { status: 401, data: { detail: 'No active account found.' } } });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    await expect(authService.login('admin@example.com', 'wrong-password')).rejects.toThrow('No active account found.');

    expect(post).toHaveBeenCalledTimes(2);
    expect(authSession.getToken()).toBe('');
  });

  it('validates missing login fields before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.login('', '')).rejects.toThrow('Email and password are required.');
    expect(post).not.toHaveBeenCalled();
  });

  it('clears auth state on logout', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'logout-token',
        user: { id: 'customer-1', email: 'admin@example.com' },
      },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    await authService.login('admin@example.com', 'secret');
    authService.logout();

    expect(authSession.getToken()).toBe('');
    expect(authSession.getUser()).toBeNull();
  });
});
