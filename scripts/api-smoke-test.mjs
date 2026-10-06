import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { setTimeout as sleep } from 'node:timers/promises';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required for the API test');
}

const port = process.env.PORT ?? '3100';
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['dist/index.js'], {
  env: { ...process.env, PORT: port },
  stdio: 'inherit',
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error('Server exited before it was ready');
    }
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // The server may still be connecting to MongoDB.
    }
    await sleep(500);
  }
  throw new Error('Server did not start within 30 seconds');
}

let userId;
try {
  await waitForServer();
  const page = await fetch(`${base}/test.html`);
  assert.equal(page.status, 200);

  const email = `ci-${randomUUID()}@example.invalid`;
  const password = randomUUID();
  const created = await fetch(`${base}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'CI Test', email, password }),
  });
  assert.equal(created.status, 201);
  userId = (await created.json()).id;

  const found = await fetch(`${base}/api/users/${userId}`);
  assert.equal(found.status, 200);
  const user = await found.json();
  assert.equal(user.email, email);
  assert.equal('password' in user, false);

  const all = await fetch(`${base}/api/users`);
  assert.equal(all.status, 200);
  assert.ok((await all.json()).some((item) => item._id === userId));

  const updated = await fetch(`${base}/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'CI Updated' }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).name, 'CI Updated');

  const deleted = await fetch(`${base}/api/users/${userId}`, { method: 'DELETE' });
  assert.equal(deleted.status, 200);
  const deletedId = userId;
  userId = undefined;
  assert.equal((await fetch(`${base}/api/users/${deletedId}`)).status, 404);
  console.log('API smoke test passed');
} finally {
  if (userId) {
    try {
      const cleanup = await fetch(`${base}/api/users/${userId}`, { method: 'DELETE' });
      if (!cleanup.ok) console.error(`Test user cleanup failed: HTTP ${cleanup.status}`);
    } catch {
      console.error('Test user cleanup request failed');
    }
  }
  if (server.exitCode === null && server.signalCode === null) {
    const stopped = once(server, 'exit');
    server.kill();
    await stopped;
  }
}
