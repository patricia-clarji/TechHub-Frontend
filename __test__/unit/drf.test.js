import { describe, it, expect } from 'vitest';
import { normalizeDrfResponse, normalizeResourceRow } from '@/services/drf';
import { getAdminResource } from '@/services/adminResources';

describe('DRF helpers', () => {
  it('normalizes paginated DRF responses', () => {
    const result = normalizeDrfResponse({ count: 2, next: '/next', previous: null, results: [{ id: 1 }] });

    expect(result).toMatchObject({ count: 2, next: '/next', previous: null, items: [{ id: 1 }] });
  });

  it('normalizes array responses', () => {
    const result = normalizeDrfResponse([{ id: 1 }, { id: 2 }]);

    expect(result.count).toBe(2);
    expect(result.items).toHaveLength(2);
  });

  it('builds readable rows from nested DRF records', () => {
    const row = normalizeResourceRow({
      id: 'p-1',
      name: 'Laptop',
      brand: { name: 'BrandCo' },
      categories: [{ category: { name: 'Computers' } }],
      remaining_stock: 4,
      discounted_price_range: '99',
    }, getAdminResource('products'));

    expect(row).toMatchObject({ id: 'p-1', name: 'Laptop', brand: 'BrandCo', category: 'Computers', stock: '4' });
  });
});
