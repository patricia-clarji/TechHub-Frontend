import { test, expect } from '@playwright/test';

const routes = [
  ['/admin/overview', 'Operations overview'],
  ['/admin/analytics', 'Operations overview'],
  ['/admin/products', 'Products'],
  ['/admin/product-variants', 'Product Variants'],
  ['/admin/categories', 'Categories'],
  ['/admin/collections', 'Collections'],
  ['/admin/brands', 'Brands'],
  ['/admin/variant-types', 'Variant Types'],
  ['/admin/orders', 'Order Summaries'],
  ['/admin/checkout', 'Checkout'],
  ['/admin/cart', 'Cart'],
  ['/admin/customers', 'Customers'],
  ['/admin/customer-addresses', 'Customer Addresses'],
  ['/admin/wishlist', 'Wishlist'],
  ['/admin/product-notification-requests', 'Product Notification Requests'],
  ['/admin/shipping-countries', 'Shipping Countries'],
  ['/admin/promotions', 'Promo Codes'],
  ['/admin/free-deliveries', 'Free Deliveries'],
  ['/admin/banners', 'Banners'],
  ['/admin/announcement-bars', 'Announcement Bars'],
  ['/admin/stores', 'Stores'],
  ['/admin/policies', 'Policies'],
  ['/admin/payment-methods', 'Payment Methods'],
  ['/admin/available-payment-methods', 'Available Payment Methods'],
  ['/admin/contact', 'Contact Messages'],
  ['/admin/submit-product-requests', 'Submit Product Requests'],
  ['/admin/settings', 'Store settings'],
];

const mockLogin = async (page) => {
  await page.route('**/auth/login/', async (route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'header.payload.signature',
        user: { id: 'customer-1', email: body.email, first_name: 'Demo', last_name: 'Operator' },
      }),
    });
  });
};

const signIn = async (page, redirect = '/admin/overview') => {
  await page.goto(`/admin/login?redirect=${encodeURIComponent(redirect)}`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('secret-password');
  await page.locator('.admin-login-form').getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(new RegExp(redirect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
};

test.describe('admin workspace routes', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    await page.route('**/store/apis/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      const label = path.split('/').filter(Boolean).at(-1) || 'record';
      const results = [{ id: 'demo-1', name: `Demo ${label}`, title: `Demo ${label}`, remaining_stock: 4, price_range: '100', discounted_price_range: '90', status: 'In Stock', is_active: true }];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: results.length, next: null, previous: null, results }),
      });
    });
  });

  test('redirects protected admin routes to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/login\?redirect=\/admin\/products/);
  });

  for (const [path, heading] of routes) {
    test(`${path} renders without a broken route`, async ({ page }) => {
      await signIn(page, path);
      await expect(page.locator('body')).toContainText(heading);
      await expect(page.locator('body')).not.toContainText('404');
    });
  }

  test('opens a DRF detail route where supported', async ({ page }) => {
    await signIn(page, '/admin/products');
    await page.getByLabel('View details').first().click();
    await expect(page.locator('body')).toContainText('Record details');
  });

  test('write controls remain disabled in read-only DRF mode', async ({ page }) => {
    await signIn(page, '/admin/promotions');
    await expect(page.getByRole('button', { name: /add promo code/i })).toBeDisabled();
  });
});
