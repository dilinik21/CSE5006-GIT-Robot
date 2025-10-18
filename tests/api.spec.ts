import { test, expect } from '@playwright/test';

test('POST and GET /api/commands works', async ({ request }) => {
  const body = {
    username: 'tester',
    owner: 'owner1',
    repo: 'repo1',                 // ✅ use repo (not repository)
    command: 'git commit -m "test"',
  };

  const post = await request.post('http://localhost:3000/api/commands', { data: body });
  console.log('POST status', post.status(), await post.text());  // helpful if it fails
  expect(post.ok()).toBeTruthy();

  const get = await request.get('http://localhost:3000/api/commands');
  expect(get.ok()).toBeTruthy();
  const data = await get.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data[0]).toHaveProperty('username');
});
