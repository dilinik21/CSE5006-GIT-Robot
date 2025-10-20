// tests/api-update-delete.spec.ts
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test('PUT and DELETE /api/commands/:id work (prisma)', async ({ request }) => {
  // 1) CREATE
  const body = { username: 'p', owner: 'o', repo: 'r', command: 'c', orm: 'prisma' };
  const create = await request.post(`${BASE}/api/commands`, {
    data: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

  if (!create.ok()) {
    console.error('CREATE failed:', create.status(), await create.text());
  }
  expect(create.ok()).toBeTruthy();

  const created = await create.json() as any;

  // be resilient to response shape
  const id =
    created?.data?.id ??
    created?.id ??
    (Array.isArray(created) ? created[0]?.id : undefined);

  expect(typeof id).toBe('number');

  // 2) UPDATE
  const put = await request.put(`${BASE}/api/commands/${id}`, {
    data: JSON.stringify({ command: 'updated', orm: 'prisma' }),
    headers: { 'content-type': 'application/json' },
  });
  if (!put.ok()) {
    console.error('PUT failed:', put.status(), await put.text());
  }
  expect(put.ok()).toBeTruthy();

  // 3) DELETE
  const del = await request.delete(`${BASE}/api/commands/${id}`, {
    data: JSON.stringify({ orm: 'prisma' }),
    headers: { 'content-type': 'application/json' },
  });
  if (!del.ok()) {
    console.error('DELETE failed:', del.status(), await del.text());
  }
  expect(del.ok()).toBeTruthy();
});
