import { expect, test } from '@playwright/test';
import {
  assertPageLoadUnder3s,
  getE2ECredentials,
  loginViaUi,
  randomEmail
} from './utils/session';

test.describe('Landing + Auth Flows', () => {
  test('landing page loads within 3 seconds', async ({ page }) => {
    await assertPageLoadUnder3s(
      page,
      '/',
      page.getByRole('link', { name: /get started/i }).first(),
      'Landing page',
      { warmup: true }
    );
  });

  test('signup shows validation errors and can reach OTP verification step', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /continue to business setup/i }).click();
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();

    const signupEmail = randomEmail('signup');

    await page.locator('input[name="firstName"]').fill('Playwright');
    await page.locator('input[name="lastName"]').fill('Tester');
    await page.locator('input[name="phone"]').fill('08012345678');
    await page.locator('select[name="gender"]').selectOption('Male');
    await page.locator('select[name="country"]').selectOption('United States');
    await page.locator('input[name="email"]').fill(signupEmail);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('password123');

    await page.getByRole('button', { name: /continue to business setup/i }).click();
    await expect(page.getByText('Step 2 of 2')).toBeVisible();

    await page.locator('input[name="businessName"]').fill('Playwright QA Business');
    await page.locator('select[name="businessType"]').selectOption('service');
    await page.locator('input[name="acceptTerms"]').check();

    await page.getByRole('button', { name: /^Create Account$/i }).click();
    await expect(page.getByRole('heading', { name: /verify your email/i })).toBeVisible();
    await expect(page.getByText(new RegExp(signupEmail, 'i'))).toBeVisible();
  });

  test('login supports loading states and handles API failures', async ({ page }) => {
    const credentials = getE2ECredentials();

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Injected API failure for QA test'
        })
      });
    });

    await page.locator('input[type="email"]').first().fill(credentials.email);
    await page.locator('input[type="password"]').first().fill('wrong-password');
    await page.getByRole('button', { name: /^Sign In$/i }).click();
    await expect(page.getByText(/injected api failure for qa test/i)).toBeVisible();
    await page.unroute('**/api/v1/auth/login');

    await page.route('**/api/v1/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route.continue();
    });

    await page.locator('input[type="email"]').first().fill(credentials.email);
    await page.locator('input[type="password"]').first().fill(credentials.password);
    await page.getByRole('button', { name: /^Sign In$/i }).click();
    await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible();
    await expect(page).toHaveURL(/\/(dashboard|super-admin)/);
    await page.unroute('**/api/v1/auth/login');
  });

  test('authenticated pages load within 3 seconds', async ({ page }) => {
    const landingUrl = await loginViaUi(page);
    const isSuperAdminLanding = landingUrl.includes('/super-admin');

    await assertPageLoadUnder3s(
      page,
      isSuperAdminLanding ? '/super-admin' : '/dashboard',
      isSuperAdminLanding
        ? page.getByRole('heading', { name: /super admin console/i }).first()
        : page.getByRole('heading', { name: /dashboard/i }).first(),
      isSuperAdminLanding ? 'Super Admin' : 'Dashboard'
    );
    await assertPageLoadUnder3s(
      page,
      '/invoices',
      page.getByRole('heading', { name: /invoices/i }).first(),
      'Invoices'
    );
    await assertPageLoadUnder3s(
      page,
      '/customers',
      page.getByRole('heading', { name: /customers/i }).first(),
      'Customers'
    );
    await assertPageLoadUnder3s(
      page,
      '/settings',
      page.getByRole('heading', { name: /settings/i }).first(),
      'Settings'
    );
  });
});
