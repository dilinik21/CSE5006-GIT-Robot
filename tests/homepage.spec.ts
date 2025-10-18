import { test, expect } from '@playwright/test';

test('home page loads and shows title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Title seen in browser tab
  await expect(page).toHaveTitle(/Git Helper Web App/i);

  // Heading text inside page body
  await expect(page.locator('h1')).toContainText(/Git Command Helper/i);
});
