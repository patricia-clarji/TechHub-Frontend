import { afterEach, describe, expect, it, vi } from 'vitest';

const loadApiClient = async () => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_OSIMART_BASE_URL', 'https://api.example.test/store/apis');
  vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');

  let requestInterceptor;
  const requestUse = vi.fn((callback) => { requestInterceptor = callback; });
  const responseUse = vi.fn();
  const request = vi.fn();
  const post = vi.fn();

  vi.doMock('axios', () => ({
    default: {
      create: vi.fn(() => ({
        request,
        post,
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })),
    },
  }));

  const module = await import('@/services/apiClient');
  const { authSession } = await import('@/services/authSession');
  return { ...module, authSession, request, post, getRequestConfig: () => requestInterceptor };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  sessionStorage.clear();
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

  it('omits auth headers for explicitly public requests', async () => {
    const { authSession, getRequestConfig } = await loadApiClient();
    authSession.set('login-token', { email: 'customer@example.com' });

    const request = getRequestConfig()({ headers: {}, params: {}, skipAuth: true });

    expect(request.headers.Authorization).toBeUndefined();
    expect(request.params.store).toBe('store-1');
    expect(request.skipAuth).toBeUndefined();
  });

  it('surfaces DRF field validation errors in API responses', async () => {
    const { apiClient, request } = await loadApiClient();
    request.mockRejectedValueOnce({ response: { status: 400, data: { email: ['Enter a valid email.'] } } });

    const result = await apiClient.get('/customers/', { retries: 0 });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error.message).toBe('email: Enter a valid email.');
  });

  it('does not retry non-idempotent POST requests by default', async () => {
    const { apiClient, request } = await loadApiClient();
    request.mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' });

    const result = await apiClient.post('/checkout/', { total: 10 }, { retryDelay: 0 });

    expect(result.success).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('still retries safe GET requests for retryable failures', async () => {
    const { apiClient, request } = await loadApiClient();
    request
      .mockRejectedValueOnce({ code: 'ERR_NETWORK', message: 'Network Error' })
      .mockRejectedValueOnce({ code: 'ERR_NETWORK', message: 'Network Error' })
      .mockResolvedValueOnce({ status: 200, data: { results: [] } });

    const result = await apiClient.get('/products/', { retryDelay: 0 });

    expect(result.success).toBe(true);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('refreshes once and retries an authenticated 401 request', async () => {
    const { apiClient, request, post } = await loadApiClient();
    sessionStorage.setItem('techhub_auth_refresh_v1', JSON.stringify('refresh-token'));
    sessionStorage.setItem('techhub_auth_user_v1', JSON.stringify({ id: 'customer-1', email: 'customer@example.com' }));
    post.mockResolvedValueOnce({
      data: {
        access: 'new-access-token',
        refresh: 'new-refresh-token',
        user: { id: 'customer-1', email: 'customer@example.com' },
      },
    });
    request
      .mockRejectedValueOnce({ response: { status: 401, data: { detail: 'Authentication credentials were not provided.' } } })
      .mockResolvedValueOnce({ status: 200, data: { ok: true } });

    const result = await apiClient.get('/customers/', { retries: 0 });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ok: true });
    expect(post).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('uses one refresh call for multiple simultaneous 401 responses', async () => {
    const { apiClient, request, post } = await loadApiClient();
    sessionStorage.setItem('techhub_auth_refresh_v1', JSON.stringify('refresh-token'));
    sessionStorage.setItem('techhub_auth_user_v1', JSON.stringify({ id: 'customer-1', email: 'customer@example.com' }));
    let resolveRefresh;
    post.mockReturnValueOnce(new Promise((resolve) => {
      resolveRefresh = () => resolve({
        data: {
          access: 'new-access-token',
          user: { id: 'customer-1', email: 'customer@example.com' },
        },
      });
    }));
    request
      .mockRejectedValueOnce({ response: { status: 401, data: { detail: 'expired' } } })
      .mockRejectedValueOnce({ response: { status: 401, data: { detail: 'expired' } } })
      .mockResolvedValueOnce({ status: 200, data: { first: true } })
      .mockResolvedValueOnce({ status: 200, data: { second: true } });

    const first = apiClient.get('/customers/', { retries: 0, dedupe: false });
    const second = apiClient.get('/orders/', { retries: 0, dedupe: false });
    await Promise.resolve();
    resolveRefresh();

    await expect(first).resolves.toMatchObject({ success: true, data: { first: true } });
    await expect(second).resolves.toMatchObject({ success: true, data: { second: true } });
    expect(post).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(4);
  });

  it('does not refresh or retry public skipAuth catalog requests', async () => {
    const { apiClient, request, post } = await loadApiClient();
    sessionStorage.setItem('techhub_auth_refresh_v1', JSON.stringify('refresh-token'));
    sessionStorage.setItem('techhub_auth_user_v1', JSON.stringify({ id: 'customer-1', email: 'customer@example.com' }));
    request.mockRejectedValueOnce({ response: { status: 401, data: { detail: 'public rejected' } } });

    const result = await apiClient.get('/products/', { skipAuth: true, retries: 0 });

    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(post).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(1);
  });
});
