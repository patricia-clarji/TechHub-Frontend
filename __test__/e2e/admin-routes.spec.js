import { expect, test } from '@playwright/test';

test.describe('admin workspace access', () => {
  test('redirects protected admin routes to disabled staff login when staff auth is not configured', async ({ page }) => {
    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/admin\/login\?redirect=\/admin\/products/);
    await expect(page.getByRole('heading', { name: /staff access required/i })).toBeVisible();
    await expect(page.getByText(/customer accounts cannot access admin routes/i)).toBeVisible();
  });

  test('does not submit customer credentials from the admin login page', async ({ page }) => {
    const authRequests = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/auth/')) authRequests.push(request.url());
    });

    await page.goto('/admin/login?redirect=%2Fadmin%2Foverview', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Email')).toBeDisabled();
    await expect(page.getByLabel('Password')).toBeDisabled();
    await expect(page.getByRole('button', { name: /staff backend required/i })).toBeDisabled();
    expect(authRequests).toEqual([]);
  });
});
