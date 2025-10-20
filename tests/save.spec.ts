import { test, expect, request } from '@playwright/test';

test('Save button stores a command via Prisma', async ({ page }) => {
  // Load app
  await page.goto('http://localhost:3000');

  // Fill minimal fields (no token required for save)
  await page.getByTestId('orm-prisma').check();
  await page.getByTestId('input-username').fill('testuser');
  await page.getByTestId('input-owner').fill('ownerX');
  await page.getByTestId('input-repository').fill('repoX');

  // Click Save
  await page.getByTestId('btn-save').click();

  // Expect status text to include success
  const status = page.getByTestId('output-status');
  await expect(status).toContainText(/Saved to PRISMA successfully/i);

  const api = await request.newContext();
  const res = await api.get('http://localhost:3000/api/commands');
  expect(res.ok()).toBeTruthy();
  const rows = await res.json();
  expect(Array.isArray(rows)).toBeTruthy();
  expect(rows.length).toBeGreaterThan(0);
  const newest = rows[0];
  expect(newest.username).toBe('testuser');
  expect(newest.repo).toBe('repoX');
});
