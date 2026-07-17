import { expect, test } from '@playwright/test';

test('customer session survives reload and logout remains permanent', async ({ page }) => {
  let refreshCount = 0;

  await page.route('**/auth/login/', async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload.email).toBe('ada@example.com');
    expect(payload.password).toBe('StrongPassw0rd!');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'access-token-1',
        refresh: 'refresh-token-1',
        user: {
          id: 'customer-1',
          email: 'ada@example.com',
          first_name: 'Ada',
          last_name: 'Customer',
        },
      }),
    });
  });

  await page.route('**/auth/refresh/', async (route) => {
    refreshCount += 1;
    const payload = route.request().postDataJSON();
    expect(payload.refresh).toMatch(/^refresh-token-/);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: `access-token-${refreshCount + 1}`,
        refresh: `refresh-token-${refreshCount + 1}`,
        user: {
          id: 'customer-1',
          email: 'ada@example.com',
          first_name: 'Ada',
          last_name: 'Customer',
        },
      }),
    });
  });

  await page.route('**/auth/logout/', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /sign in/i }).click();
  const dialog = page.getByRole('dialog', { name: /sign in/i });
  await page.getByLabel('Email').fill('ada@example.com');
  await page.locator('#auth-password').fill('StrongPassw0rd!');
  await dialog.getByRole('button', { name: /^sign in$/i }).click();

  await expect(page.getByRole('button', { name: /ada customer/i })).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /ada customer/i })).toBeVisible();
  expect(refreshCount).toBe(1);

  await page.goto('/account', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText('ada@example.com')).toBeVisible();
  const refreshCountBeforeLogout = refreshCount;

  await page.getByRole('button', { name: /ada customer/i }).click();
  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  await expect(page.getByText('ada@example.com')).toHaveCount(0);
  expect(refreshCount).toBe(refreshCountBeforeLogout);
});
