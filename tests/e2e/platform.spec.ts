import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-ignore Backend intentionally uses native Node ES modules.
import { createApp } from '../../server/app.mjs';

let appServer: any;
let database: any;
let directory: string;
const codes = new Map<string, string>();
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'lerabyte-e2e-'));
  const { app, db } = createApp({
    databasePath: join(directory, 'lab.sqlite'),
    origin: 'http://127.0.0.1:4173',
    adminEmail: 'owner@example.com',
    sendCode: async (email: string, code: string) => codes.set(email, code),
    rateLimitOptions: { skip: () => true },
  });
  database = db;
  appServer = app.listen(4173, '127.0.0.1');
  await new Promise((resolve) => appServer.once('listening', resolve));
});
test.afterAll(async () => {
  await new Promise<void>((resolve) => appServer.close(resolve));
  database.close();
  rmSync(directory, { recursive: true, force: true });
});

test('mobile application, pending gate, approval, learning, feedback, and admin editing', async ({
  browser,
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Less watching. More building.' })).toBeVisible();
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('link', { name: 'Apply for the free beta', exact: true }).click();
  await page.getByLabel('Your name', { exact: true }).fill('Test Builder');
  await page.getByLabel('Email address', { exact: true }).fill('builder@example.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByLabel('What would you love to build?')
    .fill('A machine learning project to estimate bike rental duration.');
  await page
    .getByLabel('A quick Python check')
    .fill('It returns [2, 4, 6] because each number is multiplied by two.');
  await page.getByLabel('When could you join a weekly group session?').fill('Saturday mornings');
  await page.getByLabel('I can make time').check();
  await page.getByLabel('I’ve read the privacy notice').check();
  await page.getByRole('button', { name: 'Send my application' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your curiosity is in good company.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Check application status' }).click();
  await page.getByLabel('Email address', { exact: true }).fill('builder@example.com');
  await page.getByRole('button', { name: 'Email me a sign-in code' }).click();
  await expect(page.getByLabel('Six-digit code')).toBeVisible();
  await page.getByLabel('Six-digit code').fill(codes.get('builder@example.com')!);
  await page.getByRole('button', { name: 'Open my lab' }).click();
  await expect(page.getByRole('heading', { name: 'Your application is in.' })).toBeVisible();
  await page.goto('/learn/lesson/1-1');
  await expect(page).toHaveURL(/\/application$/);

  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const admin = await adminContext.newPage();
  await admin.goto('http://127.0.0.1:4173/signin');
  await admin.getByLabel('Email address', { exact: true }).fill('owner@example.com');
  await admin.getByRole('button', { name: 'Email me a sign-in code' }).click();
  await expect(admin.getByLabel('Six-digit code')).toBeVisible();
  await admin.getByLabel('Six-digit code').fill(codes.get('owner@example.com')!);
  await admin.getByRole('button', { name: 'Open my lab' }).click();
  await admin.getByRole('link', { name: 'Manage the lab' }).click();
  await admin.locator('.admin-application summary').click();
  await admin.getByLabel('Application status', { exact: true }).selectOption('approved');
  await admin.getByRole('button', { name: 'Save status' }).click();
  await expect(admin.getByText('Application status saved.')).toBeVisible();
  await admin.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Refresh status' }).click();
  await page.getByRole('link', { name: 'Go to my learning' }).click();
  await expect(page.getByRole('heading', { name: /Hey Test/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Start your first lesson' }).click();
  await page.getByLabel('The number written in the image', { exact: true }).check();
  await page.getByRole('button', { name: 'Check my understanding' }).click();
  await expect(page.getByText('Nice work. This lesson is complete.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Completed', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/lesson-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'My project', exact: true }).click();
  const milestone = page.locator('#week-1');
  await milestone
    .getByLabel('Link to your project or notebook')
    .fill('https://example.com/my-notebook');
  await milestone
    .getByLabel('Your reflection')
    .fill('I defined the prediction target and chose a public dataset with a suitable license.');
  await milestone.getByRole('button', { name: 'Submit milestone' }).click();
  await expect(milestone.getByRole('link', { name: 'Open submitted work' })).toBeVisible();
  await admin.reload();
  await admin.getByRole('tab', { name: /Project reviews/ }).click();
  await admin
    .getByLabel('Your feedback')
    .fill('Your target is clear. Add a simple baseline and describe how you will split the data.');
  await admin.getByLabel('Review result').selectOption('revision_requested');
  await admin.getByRole('button', { name: 'Save feedback' }).click();
  await expect(admin.getByRole('heading', { name: 'Nothing waiting for feedback' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Your target is clear. Add a simple baseline')).toBeVisible();
  await admin.getByRole('tab', { name: 'Lessons', exact: true }).click();
  await admin
    .getByLabel('Written lesson')
    .fill(
      'This is an edited lesson guide from the admin. It explains features, targets, and how a model learns from examples.',
    );
  await admin.getByRole('button', { name: 'Save lesson', exact: true }).click();
  await expect(admin.getByText('Lesson saved.', { exact: true })).toBeVisible();
  await page.goto('/learn/lesson/1-1');
  await expect(
    page.getByText('This is an edited lesson guide from the admin.', { exact: false }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  await adminContext.close();
});

test('public navigation, resource search, sample lesson and desktop layout', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('link', { name: 'Explore the program', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The path ahead' })).toBeVisible();
  await page.getByRole('link', { name: 'Try a sample lesson' }).click();
  await page.getByRole('button', { name: 'B The rental duration in minutes' }).click();
  await expect(
    page.getByText('Exactly. Duration is the numerical answer', { exact: false }),
  ).toBeVisible();
  await page.goto('/resources');
  await page.getByRole('textbox', { name: 'Search resources' }).fill('precision');
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: 'Accuracy, precision, and recall' }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Search resources' }).fill('nothing-here');
  await expect(page.getByRole('heading', { name: 'No readings found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.resource-card')).toHaveCount(7);
});
