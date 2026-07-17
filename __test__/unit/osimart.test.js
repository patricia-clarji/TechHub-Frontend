import { afterEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('@/services/apiClient', () => ({
  apiClient: { get },
}));

afterEach(() => {
  get.mockReset();
});

describe('Osimart storefront service', () => {
  it('uses a longer timeout for product list requests', async () => {
    get.mockResolvedValueOnce({
      success: true,
      data: { results: [{ id: 'product-1' }] },
    });

    const { productAPI } = await import('@/services/osimart');
    const result = await productAPI.list({ page: 1, page_size: 50 });

    expect(result).toEqual([{ id: 'product-1' }]);
    expect(get).toHaveBeenCalledWith('/products/', {
      params: { page: 1, page_size: 50 },
      skipAuth: true,
      timeout: 60000,
    });
  });
});
