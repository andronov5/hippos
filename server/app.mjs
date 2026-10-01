import express from 'express';
import { rateLimit } from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { randomBytes, randomInt, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { openDatabase } from './db.mjs';
import { lessonContent } from './lessons.mjs';
import { allLessons, units } from '../shared/course.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const validEmail = (value) =>
  value.length <= 254 &&
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(
    value,
  ) &&
  value.split('@')[0].length <= 64 &&
  !value.startsWith('.') &&
  !value.includes('..') &&
  !value.includes('.@');
const now = () => new Date().toISOString();
const fail = (status, message) => Object.assign(new Error(message), { status, expected: true });
function string(value, label, min, max) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw fail(400, `${label} must be ${min}–${max} characters.`);
  return value.trim();
}
function safeUrl(value, label = 'Link') {
  const raw = string(value, label, 8, 2048);
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error();
    return url.href;
  } catch {
    throw fail(400, `${label} must be a valid HTTPS link.`);
  }
}
function videoUrl(value) {
  if (value === '') return '';
  const url = new URL(safeUrl(value, 'Video URL'));
  if (
    url.hostname === 'www.youtube-nocookie.com' &&
    /^\/embed\/[a-zA-Z0-9_-]{11}$/.test(url.pathname)
  )
    return url.origin + url.pathname;
  if (url.hostname === 'player.vimeo.com' && /^\/video\/\d+$/.test(url.pathname)) return url.href;
  throw fail(
    400,
    'Use a youtube-nocookie.com/embed/VIDEO_ID or player.vimeo.com/video/ID embed link.',
  );
}

export function createApp(overrides = {}) {
  const production = overrides.production ?? process.env.NODE_ENV === 'production';
  const config = {
    production,
    origin: process.env.APP_ORIGIN || 'http://localhost:5173',
    databasePath: process.env.DATABASE_PATH || './data/lerabyte.sqlite',
    adminEmail: normalizeEmail(process.env.ADMIN_EMAIL),
    applicationsOpen: process.env.APPLICATIONS_OPEN !== 'false',
    devAuthConsole: process.env.DEV_AUTH_CONSOLE === 'true',
    trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 0),
    ...overrides,
  };
  config.adminEmail = normalizeEmail(config.adminEmail);
  if (!Number.isInteger(config.trustProxyHops) || config.trustProxyHops < 0)
    throw new Error('TRUST_PROXY_HOPS must be a nonnegative integer.');
  const origin = new URL(config.origin).origin;
  if (production && (!validEmail(config.adminEmail) || new URL(origin).protocol !== 'https:'))
    throw new Error('Production requires ADMIN_EMAIL and an HTTPS APP_ORIGIN.');
  if (production && config.devAuthConsole)
    throw new Error('DEV_AUTH_CONSOLE must be false in production.');
  let sendCode = overrides.sendCode;
  if (!sendCode && process.env.SMTP_HOST && process.env.SMTP_FROM) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: process.env.SMTP_SECURE !== 'true',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    sendCode = (email, code) =>
      transport.sendMail({
        from: process.env.SMTP_FROM,
        to: { address: email, name: '' },
        subject: 'Your Lerabyte Lab sign-in code',
        text: `Your sign-in code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
      });
  }
  if (!sendCode && !production && config.devAuthConsole)
    sendCode = async (email, code) =>
      console.info(`[Local development only] Sign-in code for ${email}: ${code}`);
  if (production && !sendCode) throw new Error('Production requires a configured SMTP sender.');

  const db = openDatabase(config.databasePath);
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxyHops);
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
    if (production)
      res.set({
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      });
    if (req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'no-store');
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        if (req.get('origin') !== origin)
          return res
            .status(403)
            .json({ error: 'Please submit this request from the Lerabyte website.' });
        if (!req.is('application/json')) return res.status(415).json({ error: 'Expected JSON.' });
      }
    }
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  const limiter = (limit, windowMs) =>
    rateLimit({
      windowMs,
      limit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many attempts. Please try again later.' },
      ...overrides.rateLimitOptions,
    });
  app.use('/api', limiter(300, 15 * 60_000));
  app.use((req, _res, next) => {
    const raw = req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('lab_session='))
      ?.slice(12);
    if (raw && /^[a-f0-9]{64}$/.test(raw)) {
      const user = db
        .prepare(
          'SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.hash=? AND sessions.expires_at>?',
        )
        .get(hash(raw), Date.now());
      if (user) {
        const application = db
          .prepare('SELECT name,status FROM applications WHERE email=?')
          .get(user.email);
        req.user = {
          id: user.id,
          email: user.email,
          name: application?.name || (user.email === config.adminEmail ? 'Lera' : 'Learner'),
          role: user.email === config.adminEmail ? 'admin' : 'learner',
          approved: user.email === config.adminEmail || application?.status === 'approved',
          applicationStatus: application?.status || 'none',
        };
      }
    }
    next();
  });
  const requireUser = (req, _res, next) =>
    req.user ? next() : next(fail(401, 'Sign in to continue.'));
  const requireLearner = (req, _res, next) =>
    !req.user
      ? next(fail(401, 'Sign in to continue.'))
      : req.user.approved
        ? next()
        : next(fail(403, 'Your beta application needs approval before you can access the lab.'));
  const requireAdmin = (req, _res, next) =>
    req.user?.role === 'admin'
      ? next()
      : next(fail(req.user ? 403 : 401, 'Admin access required.'));
  const sessionCookie = (token, maxAge) =>
    `lab_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${production ? '; Secure' : ''}`;

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/config', (_req, res) => res.json({ applicationsOpen: config.applicationsOpen }));
  app.get('/api/me', (req, res) => res.json({ user: req.user || null }));
  app.post('/api/applications', limiter(6, 60 * 60_000), (req, res) => {
    if (!config.applicationsOpen)
      throw fail(409, 'Applications are currently closed. Please check back for the next cohort.');
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) throw fail(400, 'Enter a valid email address.');
    const name = string(req.body.name, 'Name', 1, 80);
    const timezone = string(req.body.timezone, 'Time zone', 1, 80);
    try {
      new Intl.DateTimeFormat('en', { timeZone: timezone });
    } catch {
      throw fail(400, 'Choose a valid time zone.');
    }
    if (!['basics', 'comfortable', 'experienced'].includes(req.body.pythonLevel))
      throw fail(400, 'Choose your Python experience.');
    const readiness = string(req.body.readiness, 'Python response', 10, 800);
    const goal = string(req.body.goal, 'Project goal', 20, 1500);
    const availability = string(req.body.availability, 'Availability', 3, 200);
    if (req.body.commitment !== true || req.body.privacyConsent !== true)
      throw fail(400, 'Confirm the weekly commitment and privacy notice.');
    // Never overwrite an existing application anonymously or reveal whether an email applied.
    db.prepare(
      'INSERT OR IGNORE INTO applications (id,email,name,timezone,python_level,readiness,goal,availability,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    ).run(
      randomUUID(),
      email,
      name,
      timezone,
      req.body.pythonLevel,
      readiness,
      goal,
      availability,
      now(),
    );
    res.status(201).json({
      message:
        'Your application has been received. Sign in with the same email to check its status.',
    });
  });
  app.post('/api/auth/request-code', limiter(8, 15 * 60_000), async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) throw fail(400, 'Enter a valid email address.');
    if (!sendCode)
      throw fail(503, 'Email sign-in is not available yet. Please try again once the beta opens.');
    const previous = db.prepare('SELECT expires_at FROM auth_codes WHERE email=?').get(email);
    if (previous?.expires_at > Date.now() + 9 * 60_000)
      throw fail(429, 'Wait one minute before requesting another code.');
    const code = String(randomInt(100000, 1000000));
    db.prepare(
      'INSERT OR REPLACE INTO auth_codes (email,hash,expires_at,attempts) VALUES (?,?,?,0)',
    ).run(email, hash(`${email}:${code}`), Date.now() + 10 * 60_000);
    try {
      await sendCode(email, code);
    } catch {
      db.prepare('DELETE FROM auth_codes WHERE email=? AND hash=?').run(
        email,
        hash(`${email}:${code}`),
      );
      throw fail(503, 'We could not send your code. Please try again shortly.');
    }
    db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());
    db.prepare('DELETE FROM auth_codes WHERE expires_at<?').run(Date.now());
    res.json({ message: 'A six-digit code is on its way. It expires in 10 minutes.' });
  });
  app.post('/api/auth/verify', limiter(25, 15 * 60_000), (req, res) => {
    const email = normalizeEmail(req.body.email);
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    if (!validEmail(email) || !/^\d{6}$/.test(code))
      throw fail(400, 'Enter your email and six-digit code.');
    const record = db.prepare('SELECT * FROM auth_codes WHERE email=?').get(email);
    const matches =
      record &&
      record.expires_at > Date.now() &&
      record.attempts < 5 &&
      timingSafeEqual(
        Buffer.from(record.hash, 'hex'),
        Buffer.from(hash(`${email}:${code}`), 'hex'),
      );
    if (!matches) {
      if (record) db.prepare('UPDATE auth_codes SET attempts=attempts+1 WHERE email=?').run(email);
      throw fail(400, 'That code is invalid or expired. Check your email or request a new one.');
    }
    db.prepare('DELETE FROM auth_codes WHERE email=?').run(email);
    db.prepare('INSERT OR IGNORE INTO users (id,email,created_at) VALUES (?,?,?)').run(
      randomUUID(),
      email,
      now(),
    );
    const user = db.prepare('SELECT id FROM users WHERE email=?').get(email);
    // Rotate a previous browser session on sign-in.
    const previousToken = req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('lab_session='))
      ?.slice(12);
    if (previousToken) db.prepare('DELETE FROM sessions WHERE hash=?').run(hash(previousToken));
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (hash,user_id,expires_at) VALUES (?,?,?)').run(
      hash(token),
      user.id,
      Date.now() + 7 * 24 * 60 * 60_000,
    );
    res.setHeader('Set-Cookie', sessionCookie(token, 7 * 24 * 60 * 60));
    res.json({ ok: true });
  });
  app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('lab_session='))
      ?.slice(12);
    if (token) db.prepare('DELETE FROM sessions WHERE hash=?').run(hash(token));
    res.setHeader('Set-Cookie', sessionCookie('', 0)).json({ ok: true });
  });
  app.get('/api/application', requireUser, (req, res) => {
    res.json({
      application:
        db
          .prepare('SELECT name,status,created_at FROM applications WHERE email=?')
          .get(req.user.email) || null,
    });
  });
  app.get('/api/learning', requireLearner, (req, res) => {
    res.json({
      lessons: db
        .prepare(
          "SELECT id,published, CASE WHEN video_url != '' THEN 1 ELSE 0 END AS hasVideo FROM lessons",
        )
        .all(),
      progress: db
        .prepare('SELECT lesson_id,score,completed_at FROM progress WHERE user_id=?')
        .all(req.user.id),
      submissions: db
        .prepare('SELECT * FROM submissions WHERE user_id=? ORDER BY week')
        .all(req.user.id),
      session: JSON.parse(
        db.prepare('SELECT value FROM settings WHERE key=?').get('session').value,
      ),
    });
  });
  app.get('/api/lessons/:id', requireLearner, (req, res) => {
    const row = db.prepare('SELECT * FROM lessons WHERE id=?').get(req.params.id);
    if (!row || (!row.published && req.user.role !== 'admin'))
      throw fail(404, 'This lesson is not available yet.');
    const content = lessonContent[row.id];
    res.json({
      ...row,
      ...allLessons.find((l) => l.id === row.id),
      takeaways: content.takeaways,
      exercise: content.exercise,
      quiz: content.quiz.map(({ answer, explanation, ...question }) => question),
    });
  });
  app.post('/api/lessons/:id/quiz', requireLearner, (req, res) => {
    const row = db.prepare('SELECT published FROM lessons WHERE id=?').get(req.params.id);
    if (!row || (!row.published && req.user.role !== 'admin'))
      throw fail(404, 'This lesson is not available yet.');
    const questions = lessonContent[req.params.id].quiz;
    const answers = req.body.answers;
    if (
      !Array.isArray(answers) ||
      answers.length !== questions.length ||
      answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= questions[i].options.length)
    )
      throw fail(400, 'Answer each question before checking your work.');
    const feedback = questions.map((q, i) => ({
      correct: answers[i] === q.answer,
      answer: q.answer,
      explanation: q.explanation,
    }));
    const score = Math.round((feedback.filter((f) => f.correct).length / questions.length) * 100);
    const passed = score >= 80;
    if (passed)
      db.prepare(
        'INSERT INTO progress (user_id,lesson_id,score,completed_at) VALUES (?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET score=MAX(score,excluded.score)',
      ).run(req.user.id, req.params.id, score, now());
    res.json({ score, passed, feedback });
  });
  app.post('/api/submissions', requireLearner, (req, res) => {
    const week = Number(req.body.week);
    if (!Number.isInteger(week) || !units.some((u) => u.id === week))
      throw fail(400, 'Choose a valid week.');
    const url = safeUrl(req.body.url, 'Project link');
    const notes = string(req.body.notes, 'Reflection', 20, 3000);
    db.prepare(
      "INSERT INTO submissions (id,user_id,week,url,notes,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id,week) DO UPDATE SET url=excluded.url,notes=excluded.notes,status='submitted',updated_at=excluded.updated_at",
    ).run(randomUUID(), req.user.id, week, url, notes, now());
    res.json({ ok: true });
  });

  app.get('/api/admin', requireAdmin, (_req, res) =>
    res.json({
      applications: db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all(),
      submissions: db
        .prepare(
          'SELECT submissions.*,users.email,applications.name FROM submissions JOIN users ON users.id=submissions.user_id LEFT JOIN applications ON applications.email=users.email ORDER BY updated_at DESC',
        )
        .all(),
      lessons: db.prepare('SELECT * FROM lessons ORDER BY id').all(),
      learnerProgress: db
        .prepare(
          "SELECT users.id,users.email,applications.name,COUNT(progress.lesson_id) AS completed FROM users JOIN applications ON applications.email=users.email LEFT JOIN progress ON progress.user_id=users.id WHERE applications.status='approved' GROUP BY users.id ORDER BY applications.name",
        )
        .all(),
      session: JSON.parse(
        db.prepare('SELECT value FROM settings WHERE key=?').get('session').value,
      ),
    }),
  );
  app.patch('/api/admin/applications/:id', requireAdmin, (req, res) => {
    if (!['pending', 'approved', 'waitlisted', 'declined'].includes(req.body.status))
      throw fail(400, 'Choose a valid status.');
    const application = db.prepare('SELECT * FROM applications WHERE id=?').get(req.params.id);
    if (!application) throw fail(404, 'Application not found.');
    if (
      req.body.status === 'approved' &&
      application.status !== 'approved' &&
      db.prepare("SELECT COUNT(*) AS count FROM applications WHERE status='approved'").get()
        .count >= 15
    )
      throw fail(409, 'This beta is limited to 15 approved learners.');
    db.prepare('UPDATE applications SET status=? WHERE id=?').run(req.body.status, req.params.id);
    // Membership is checked against the current application on every request, so revocation is immediate.
    res.json({ ok: true });
  });
  app.patch('/api/admin/lessons/:id', requireAdmin, (req, res) => {
    if (!lessonContent[req.params.id]) throw fail(404, 'Lesson not found.');
    const body = string(req.body.body, 'Lesson text', 40, 30000);
    const video = videoUrl(req.body.videoUrl);
    if (typeof req.body.published !== 'boolean') throw fail(400, 'Choose the lesson visibility.');
    db.prepare('UPDATE lessons SET body=?,video_url=?,published=? WHERE id=?').run(
      body,
      video,
      Number(req.body.published),
      req.params.id,
    );
    res.json({ ok: true });
  });
  app.patch('/api/admin/submissions/:id', requireAdmin, (req, res) => {
    if (!['reviewed', 'revision_requested'].includes(req.body.status))
      throw fail(400, 'Choose a review status.');
    const feedback = string(req.body.feedback, 'Feedback', 10, 3000);
    const result = db
      .prepare('UPDATE submissions SET feedback=?,status=? WHERE id=?')
      .run(feedback, req.body.status, req.params.id);
    if (!result.changes) throw fail(404, 'Submission not found.');
    res.json({ ok: true });
  });
  app.patch('/api/admin/session', requireAdmin, (req, res) => {
    const title = string(req.body.title, 'Session title', 3, 100);
    const description = string(req.body.description, 'Description', 10, 1000);
    const date = req.body.date === '' ? '' : new Date(req.body.date);
    if (date !== '' && !Number.isFinite(date.getTime()))
      throw fail(400, 'Choose a valid session date.');
    const url = req.body.url === '' ? '' : safeUrl(req.body.url, 'Session link');
    db.prepare('UPDATE settings SET value=? WHERE key=?').run(
      JSON.stringify({ title, description, date: date === '' ? '' : date.toISOString(), url }),
      'session',
    );
    res.json({ ok: true });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'This endpoint does not exist.' }));
  if (config.serveStatic !== false) {
    app.use(express.static(resolve('dist'), { index: false }));
    app.get('/{*path}', (_req, res, next) =>
      res.sendFile(resolve('dist/index.html'), (error) => error && next(error)),
    );
  }
  app.use((error, _req, res, _next) => {
    const status = error.status || (error.type === 'entity.too.large' ? 413 : 500);
    if (status >= 500) console.error('Request failed:', error.code || error.name);
    res.status(status).json({
      error:
        status >= 500 && !error.expected
          ? 'Something went wrong. Please try again.'
          : error.message,
    });
  });
  return { app, db, config };
}
