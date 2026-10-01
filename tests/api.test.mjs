import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';
import { lessonContent } from '../server/lessons.mjs';

const origin = 'http://localhost:4173';
const application = (email = 'learner@example.com') => ({
  name: 'Curious Learner',
  email,
  timezone: 'America/Denver',
  pythonLevel: 'basics',
  readiness: 'It produces [2, 4, 6], doubling each number.',
  goal: 'I want to predict bike rental duration with public data.',
  availability: 'Saturday mornings',
  commitment: true,
  privacyConsent: true,
});

async function fixture(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'lerabyte-test-'));
  const codes = new Map();
  const { app, db, config } = createApp({
    databasePath: join(directory, 'lab.sqlite'),
    origin,
    adminEmail: 'owner@example.com',
    sendCode: async (email, code) => codes.set(email, code),
    serveStatic: false,
    rateLimitOptions: { skip: () => true },
    ...options,
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  });
  async function request(path, method = 'GET', body, cookie, headers = {}) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
      method,
      headers: {
        origin,
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(cookie ? { cookie } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: response.status,
      body: await response.json(),
      cookie: response.headers.get('set-cookie'),
    };
  }
  async function signIn(email) {
    assert.equal((await request('/auth/request-code', 'POST', { email })).status, 200);
    const response = await request('/auth/verify', 'POST', { email, code: codes.get(email) });
    assert.equal(response.status, 200);
    return response.cookie.split(';')[0];
  }
  async function applyAndApprove(email) {
    assert.equal((await request('/applications', 'POST', application(email))).status, 201);
    db.prepare("UPDATE applications SET status='approved' WHERE email=?").run(email);
    return signIn(email);
  }
  return { db, request, signIn, applyAndApprove, codes, config };
}

test('applications validate inputs, normalize email and never overwrite an existing application', async (t) => {
  const { request, db } = await fixture(t);
  assert.equal(
    (await request('/applications', 'POST', { ...application(), privacyConsent: false })).status,
    400,
  );
  assert.equal(
    (await request('/applications', 'POST', { ...application(), timezone: 'not-a-timezone' }))
      .status,
    400,
  );
  assert.equal(
    (await request('/applications', 'POST', application('  Learner@Example.COM '))).status,
    201,
  );
  assert.equal(
    (await request('/applications', 'POST', { ...application(), name: 'Impersonator' })).status,
    201,
  );
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM applications').get().n, 1);
  assert.equal(db.prepare('SELECT name FROM applications').get().name, 'Curious Learner');
  assert.equal((await request('/applications')).status, 404);
});

test('pending users cannot load private content or administer the program', async (t) => {
  const { request, signIn } = await fixture(t);
  assert.equal((await request('/learning')).status, 401);
  await request('/applications', 'POST', application());
  const cookie = await signIn('learner@example.com');
  assert.equal((await request('/learning', 'GET', undefined, cookie)).status, 403);
  assert.equal((await request('/lessons/1-1', 'GET', undefined, cookie)).status, 403);
  assert.equal((await request('/admin', 'GET', undefined, cookie)).status, 403);
  assert.equal(
    (await request('/application', 'GET', undefined, cookie)).body.application.status,
    'pending',
  );
  assert.equal((await request('/me', 'GET', undefined, cookie)).body.user.role, 'learner');
});

test('email codes are hashed, one-use, expiring, and locked after five wrong attempts', async (t) => {
  const { request, codes, db } = await fixture(t);
  const email = 'first@example.com';
  const sent = await request('/auth/request-code', 'POST', { email });
  assert.equal(sent.status, 200);
  assert.equal(sent.body.code, undefined);
  assert.notEqual(
    db.prepare('SELECT hash FROM auth_codes WHERE email=?').get(email).hash,
    codes.get(email),
  );
  const verified = await request('/auth/verify', 'POST', {
    email,
    code: codes.get(email),
    role: 'admin',
  });
  assert.equal(verified.status, 200);
  assert.match(verified.cookie, /HttpOnly/);
  assert.match(verified.cookie, /SameSite=Lax/);
  assert.equal(
    (await request('/auth/verify', 'POST', { email, code: codes.get(email) })).status,
    400,
  );
  assert.equal((await request('/me', 'GET', undefined, verified.cookie)).body.user.role, 'learner');
  const second = 'second@example.com';
  await request('/auth/request-code', 'POST', { email: second });
  const wrong = codes.get(second) === '111111' ? '222222' : '111111';
  for (let attempt = 0; attempt < 5; attempt++)
    assert.equal(
      (await request('/auth/verify', 'POST', { email: second, code: wrong })).status,
      400,
    );
  assert.equal(
    (await request('/auth/verify', 'POST', { email: second, code: codes.get(second) })).status,
    400,
  );
  const third = 'third@example.com';
  await request('/auth/request-code', 'POST', { email: third });
  db.prepare('UPDATE auth_codes SET expires_at=0 WHERE email=?').run(third);
  assert.equal(
    (await request('/auth/verify', 'POST', { email: third, code: codes.get(third) })).status,
    400,
  );
});

test('quiz grading is server-side and learner progress and submissions stay isolated', async (t) => {
  const { request, applyAndApprove } = await fixture(t);
  const first = await applyAndApprove('first@example.com');
  const second = await applyAndApprove('second@example.com');
  const lesson = await request('/lessons/1-1', 'GET', undefined, first);
  assert.equal(lesson.status, 200);
  assert.equal(lesson.body.quiz[0].answer, undefined);
  assert.equal(lesson.body.quiz[0].explanation, undefined);
  const failed = await request('/lessons/1-1/quiz', 'POST', { answers: [0], score: 100 }, first);
  assert.equal(failed.body.passed, false);
  assert.equal((await request('/learning', 'GET', undefined, first)).body.progress.length, 0);
  const passed = await request('/lessons/1-1/quiz', 'POST', { answers: [1] }, first);
  assert.equal(passed.body.passed, true);
  assert.equal((await request('/learning', 'GET', undefined, first)).body.progress.length, 1);
  assert.equal((await request('/learning', 'GET', undefined, second)).body.progress.length, 0);
  assert.equal(
    (
      await request(
        '/submissions',
        'POST',
        { week: 1, url: 'javascript:alert(1)', notes: 'Here is a reflection that is long enough.' },
        first,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        '/submissions',
        'POST',
        {
          week: 1,
          url: 'https://example.com/project',
          notes: 'I chose a dataset and wrote a clear target definition.',
          user_id: 'not-this-user',
        },
        first,
      )
    ).status,
    200,
  );
  assert.equal((await request('/learning', 'GET', undefined, second)).body.submissions.length, 0);
  assert.equal((await request('/learning', 'GET', undefined, first)).body.submissions.length, 1);
});

test('admin approval and revocation take effect immediately and cap the cohort at fifteen', async (t) => {
  const { request, signIn, db } = await fixture(t);
  const admin = await signIn('owner@example.com');
  await request('/applications', 'POST', application());
  const learner = await signIn('learner@example.com');
  const id = db.prepare('SELECT id FROM applications').get().id;
  assert.equal(
    (await request(`/admin/applications/${id}`, 'PATCH', { status: 'approved' }, learner)).status,
    403,
  );
  assert.equal(
    (await request(`/admin/applications/${id}`, 'PATCH', { status: 'approved' }, admin)).status,
    200,
  );
  assert.equal((await request('/learning', 'GET', undefined, learner)).status, 200);
  assert.equal(
    (await request(`/admin/applications/${id}`, 'PATCH', { status: 'waitlisted' }, admin)).status,
    200,
  );
  assert.equal((await request('/learning', 'GET', undefined, learner)).status, 403);
  for (let i = 0; i < 15; i++) {
    const email = `person-${i}@example.com`;
    await request('/applications', 'POST', application(email));
    db.prepare("UPDATE applications SET status='approved' WHERE email=?").run(email);
  }
  assert.equal(
    (await request(`/admin/applications/${id}`, 'PATCH', { status: 'approved' }, admin)).status,
    409,
  );
});

test('admin can publish content, schedule sessions, review projects, and preserve feedback on revisions', async (t) => {
  const { request, signIn, applyAndApprove } = await fixture(t);
  const admin = await signIn('owner@example.com');
  const learner = await applyAndApprove('learner@example.com');
  assert.equal(
    (
      await request(
        '/admin/lessons/1-1',
        'PATCH',
        {
          body: lessonContent['1-1'].body,
          videoUrl: 'https://evil.example/embed/abc',
          published: true,
        },
        admin,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        '/admin/lessons/1-1',
        'PATCH',
        { body: lessonContent['1-1'].body, videoUrl: '', published: false },
        admin,
      )
    ).status,
    200,
  );
  assert.equal((await request('/lessons/1-1', 'GET', undefined, learner)).status, 404);
  assert.equal((await request('/lessons/1-1/quiz', 'POST', { answers: [1] }, learner)).status, 404);
  assert.equal(
    (
      await request(
        '/admin/session',
        'PATCH',
        {
          title: 'Saturday build room',
          description: 'Bring your notebook and one specific question.',
          date: '2026-10-17T18:00:00.000Z',
          url: 'https://example.com/meeting',
        },
        admin,
      )
    ).status,
    200,
  );
  assert.equal(
    (await request('/learning', 'GET', undefined, learner)).body.session.title,
    'Saturday build room',
  );
  await request(
    '/submissions',
    'POST',
    {
      week: 1,
      url: 'https://example.com/project',
      notes: 'My first project brief explains the prediction target.',
    },
    learner,
  );
  const submission = (await request('/admin', 'GET', undefined, admin)).body.submissions[0];
  assert.equal(
    (
      await request(
        `/admin/submissions/${submission.id}`,
        'PATCH',
        { status: 'reviewed', feedback: 'Looks clear. Explain the dataset license next.' },
        learner,
      )
    ).status,
    403,
  );
  await request(
    `/admin/submissions/${submission.id}`,
    'PATCH',
    { status: 'revision_requested', feedback: 'Looks clear. Explain the dataset license next.' },
    admin,
  );
  let saved = (await request('/learning', 'GET', undefined, learner)).body.submissions[0];
  assert.equal(saved.status, 'revision_requested');
  await request(
    '/submissions',
    'POST',
    {
      week: 1,
      url: 'https://example.com/project',
      notes: 'I added the dataset attribution and license details.',
    },
    learner,
  );
  saved = (await request('/learning', 'GET', undefined, learner)).body.submissions[0];
  assert.equal(saved.status, 'submitted');
  assert.equal(saved.feedback, 'Looks clear. Explain the dataset license next.');
});

test('cross-origin mutations and non-JSON submissions are rejected; logout invalidates sessions', async (t) => {
  const { request, applyAndApprove } = await fixture(t);
  assert.equal(
    (
      await request('/applications', 'POST', application(), undefined, {
        origin: 'https://another.example',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request('/applications', 'POST', application(), undefined, {
        'content-type': 'text/plain',
      })
    ).status,
    415,
  );
  const cookie = await applyAndApprove('learner@example.com');
  assert.equal((await request('/auth/logout', 'POST', {}, cookie)).status, 200);
  assert.equal((await request('/learning', 'GET', undefined, cookie)).status, 401);
});

test('data survives opening a second database connection', async (t) => {
  const { request, applyAndApprove, config } = await fixture(t);
  const cookie = await applyAndApprove('learner@example.com');
  await request('/lessons/1-1/quiz', 'POST', { answers: [1] }, cookie);
  const second = openDatabase(config.databasePath);
  assert.equal(second.prepare('SELECT COUNT(*) AS n FROM applications').get().n, 1);
  assert.equal(second.prepare('SELECT COUNT(*) AS n FROM progress').get().n, 1);
  second.close();
});

test('production refuses unsafe auth configuration and closed applications remain closed', async (t) => {
  assert.throws(
    () =>
      createApp({
        production: true,
        origin: 'http://localhost:3001',
        adminEmail: 'owner@example.com',
      }),
    /HTTPS/,
  );
  assert.throws(
    () =>
      createApp({
        production: true,
        origin: 'https://lab.example',
        adminEmail: 'owner@example.com',
        devAuthConsole: true,
      }),
    /DEV_AUTH_CONSOLE/,
  );
  const { request } = await fixture(t, { applicationsOpen: false });
  assert.equal((await request('/applications', 'POST', application())).status, 409);
});
