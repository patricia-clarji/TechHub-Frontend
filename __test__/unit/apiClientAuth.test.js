import { afterEach, describe, expect, it, vi } from 'vitest';

const loadApiClient = async () => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_OSIMART_BASE_URL', 'https://api.example.test/store/apis');
  vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');

  let requestInterceptor;
  const requestUse = vi.fn((callback) => { requestInterceptor = callback; });
  const responseUse = vi.fn();

  vi.doMock('axios', () => ({
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
        request: vi.fn(),
      })),
    },
  }));

  const module = await import('@/services/apiClient');
  const { authSession } = await import('@/services/authSession');
  return { ...module, authSession, getRequestConfig: () => requestInterceptor };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('apiClient auth headers', () => {
  it('adds a Bearer token to Osimart requests when a login token exists', async () => {
    const { authSession, getRequestConfig } = await loadApiClient();
    authSession.set('login-token', { email: 'admin@example.com' });

    const request = getRequestConfig()({ headers: {}, params: {} });

    expect(request.headers.Authorization).toBe('Bearer login-token');
    expect(request.params.store).toBe('store-1');
  });

  it('does not add auth headers when no login token exists', async () => {
    const { getRequestConfig } = await loadApiClient();

    const request = getRequestConfig()({ headers: {}, params: {}, requireAuth: true });

    expect(request.headers.Authorization).toBeUndefined();
    expect(request.params.store).toBe('store-1');
    expect(request.requireAuth).toBeUndefined();
  });
});
