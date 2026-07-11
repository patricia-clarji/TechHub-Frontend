import { expect, test } from '@playwright/test';

test('chatbot sends a message and renders a mocked proxy reply without console errors', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  let requestBody;
  let requestCount = 0;
  await page.route('**/api/chatbot', async (route) => {
    requestCount += 1;
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reply: 'To add a product to your cart, open the product page, choose any required variant, then use the Add to Cart button.',
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /open techhub concierge/i }).click();
  await page.locator('#assistant-message').fill('How do I add a product to my cart?');
  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.getByText('To add a product to your cart')).toBeVisible();
  expect(requestCount).toBe(1);
  expect(requestBody.message).toBe('How do I add a product to my cart?');
  expect(requestBody.stream).toBe(false);
  expect(requestBody.context).toBeTruthy();
  expect(consoleErrors).toEqual([]);
});
