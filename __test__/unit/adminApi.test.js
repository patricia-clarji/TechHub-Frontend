import { describe, it, expect, vi, afterEach } from 'vitest';

const loadAdminApi = async () => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_OSIMART_BASE_URL', 'https://api.example.test/store/apis');
  vi.stubEnv('VITE_OSIMART_AUTH_URL', 'https://api.example.test/auth');
  vi.stubEnv('VITE_OSIMART_STORE_ID', 'store-1');
  vi.stubEnv('VITE_OSIMART_ADMIN_URL', '');

  const get = vi.fn().mockResolvedValue({
    success: true,
    data: { count: 1, next: null, previous: null, results: [{ id: 'product-1', name: 'Laptop' }] },
  });
  vi.doMock('@/services/apiClient', () => ({ apiClient: { get } }));
  vi.doMock('axios', () => ({ default: { create: vi.fn(() => ({ request: vi.fn() })) } }));

  const module = await import('@/services/adminApi');
  return { ...module, get };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('adminApi DRF reads', () => {
  it('maps resource list reads to existing DRF endpoints', async () => {
    const { adminApi, get } = await loadAdminApi();

    const result = await adminApi.listResource('products', { page: 1, page_size: 10, search: 'lap' });

    expect(result.items).toEqual([{ id: 'product-1', name: 'Laptop' }]);
    expect(get).toHaveBeenCalledWith('/products/', { params: { page: 1, page_size: 10, search: 'lap' } });
  });

  it('maps detail reads to existing DRF detail endpoints', async () => {
    const { adminApi, get } = await loadAdminApi();

    await adminApi.getResourceDetail('products', 'product 1');

    expect(get).toHaveBeenCalledWith('/products/product%201/');
  });

  it('keeps unconfirmed writes disabled', async () => {
    const { adminApi, UnsupportedAdminOperationError } = await loadAdminApi();

    await expect(adminApi.createProduct({ name: 'Laptop' })).rejects.toBeInstanceOf(UnsupportedAdminOperationError);
    expect(adminApi.mode).toBe('drf-read-only');
  });
});
