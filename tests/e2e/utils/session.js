import { expect } from '@playwright/test';

export const getE2ECredentials = () => {
  const email =
    process.env.E2E_USER_EMAIL
    || process.env.SUPERADMIN_EMAIL
    || process.env.ADMIN_EMAIL;
  const password =
    process.env.E2E_USER_PASSWORD
    || process.env.SUPERADMIN_PASSWORD
    || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing E2E credentials. Set E2E_USER_EMAIL and E2E_USER_PASSWORD (or SUPERADMIN/ADMIN env vars).'
    );
  }

  return { email, password };
};

export const randomEmail = (prefix = 'qa') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

export const loginViaUi = async (page, credentials = getE2ECredentials()) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').first().fill(credentials.email);
  await page.locator('input[type="password"]').first().fill(credentials.password);
  await page.getByRole('button', { name: /^Sign In$/i }).click();
  try {
    await expect(page).toHaveURL(/\/(dashboard|super-admin)/, { timeout: 15_000 });
  } catch (error) {
    const errorBanner = page
      .locator('p')
      .filter({
        hasText:
          /network error|invalid credentials|verify your email|account is deactivated|failed/i
      })
      .first();
    const bannerVisible = await errorBanner.isVisible().catch(() => false);
    const bannerText = bannerVisible ? await errorBanner.innerText() : '';
    const extra = bannerText ? ` Login error shown: "${bannerText}".` : '';
    throw new Error(
      `Login did not reach dashboard. Current URL: ${page.url()}.${extra} Original error: ${error.message}`
    );
  }
  return page.url();
};

export const assertPageLoadUnder3s = async (
  page,
  path,
  readyLocator,
  label,
  options = {}
) => {
  if (options.warmup) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(readyLocator, `${label || path} warmup navigation was not ready`).toBeVisible();
  }

  const start = Date.now();
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(readyLocator, `${label || path} was not ready after navigation`).toBeVisible();
  const elapsedMs = Date.now() - start;
  expect(
    elapsedMs,
    `${label || path} took ${elapsedMs}ms (expected <= 3000ms)`
  ).toBeLessThanOrEqual(3000);
  return elapsedMs;
};
