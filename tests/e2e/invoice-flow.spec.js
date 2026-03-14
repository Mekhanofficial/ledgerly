import { expect, test } from '@playwright/test';
import { getE2ECredentials, loginViaUi, randomEmail } from './utils/session';

const API_BASE_URL = process.env.E2E_API_URL || 'http://127.0.0.1:7000/api/v1';

const authenticateViaApi = async (request, credentials) => {
  const authResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password
    }
  });

  if (!authResponse.ok()) {
    const body = await authResponse.text();
    throw new Error(`Unable to authenticate for API setup (${authResponse.status()}): ${body}`);
  }

  const authData = await authResponse.json();
  const token = authData?.token;
  if (!token) {
    throw new Error('Auth response did not include token for API setup.');
  }
  return token;
};

const createCustomerViaApi = async (request, credentials) => {
  const token = await authenticateViaApi(request, credentials);
  const customerName = `PW API Customer ${Date.now()}`;
  const createResponse = await request.post(`${API_BASE_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: {
      name: customerName,
      email: randomEmail('pw_customer_api'),
      phone: `080${Date.now().toString().slice(-8)}`
    }
  });

  if (!createResponse.ok()) {
    const body = await createResponse.text();
    throw new Error(`Unable to create API customer (${createResponse.status()}): ${body}`);
  }

  return customerName;
};

const deleteInvoiceViaApi = async (request, credentials, invoiceId) => {
  const token = await authenticateViaApi(request, credentials);
  const response = await request.delete(`${API_BASE_URL}/invoices/${invoiceId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Unable to delete invoice via API (${response.status()}): ${body}`);
  }
};

const getSuperAdminCredentials = () => {
  const email = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'Missing SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD env vars for invoice deletion validation.'
    );
  }
  return { email, password };
};

test.describe('Invoice Lifecycle', () => {
  test('can navigate between core protected pages', async ({ page }) => {
    await loginViaUi(page);

    await page.goto('/invoices', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /invoices/i }).first()).toBeVisible();

    await page.goto('/customers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /customers/i }).first()).toBeVisible();

    await page.goto('/reports', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /reports/i }).first()).toBeVisible();

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible();
  });

  test('creates draft, edits, sends, downloads PDF, deletes invoice, and logs out', async ({ page, request }) => {
    const credentials = getE2ECredentials();
    const customerName = await createCustomerViaApi(request, credentials);

    await loginViaUi(page, credentials);

    await page.goto('/invoices/create', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /create invoice/i })).toBeVisible();

    const invoiceNumberInput = page
      .locator('label:has-text("Invoice Number")')
      .locator('xpath=following-sibling::input[1]');
    const invoiceNumber = await invoiceNumberInput.inputValue();

    const customerSelect = page.getByRole('combobox').first();
    await expect(customerSelect).toContainText(customerName);
    await customerSelect.selectOption({ label: customerName });
    await expect(customerSelect).toHaveValue(/.+/);

    await page.getByRole('textbox', { name: /description for line item 1/i }).fill('Playwright QA invoice item');
    const [saveDraftResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/v1/invoices')
          && response.request().method() === 'POST',
        { timeout: 45_000 }
      ),
      page.getByRole('button', { name: /save draft/i }).first().click()
    ]);

    if (!saveDraftResponse.ok()) {
      const responseBody = await saveDraftResponse.text();
      throw new Error(
        `Save draft API failed with status ${saveDraftResponse.status()}: ${responseBody}`
      );
    }

    await expect(page).toHaveURL(/\/invoices\/drafts/, { timeout: 45_000 });
    await expect(page.getByRole('link', { name: invoiceNumber }).first()).toBeVisible();
    await page.getByRole('link', { name: invoiceNumber }).first().click();

    await expect(page).toHaveURL(/\/invoices\/edit\//);
    await page.locator('textarea').first().fill('Edited by Playwright automated QA flow');
    await page.getByRole('button', { name: /send invoice/i }).click();

    await expect(page.getByRole('button', { name: /sending/i })).toBeVisible();
    await expect(page).toHaveURL(/\/invoices/);
    await expect(page.getByText(invoiceNumber).first()).toBeVisible();
    const invoiceSearchInput = page.getByPlaceholder('Search invoices...').first();
    await invoiceSearchInput.fill(invoiceNumber);

    let invoiceRow = page.locator('tr', { hasText: invoiceNumber }).first();
    await expect(invoiceRow).toBeVisible({ timeout: 30_000 });
    await invoiceRow.getByTitle('Download PDF with template').click();
    await expect(page.getByRole('heading', { name: /download invoice pdf/i })).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /^Download PDF$/i, exact: true }).click()
    ]);
    expect(download.suggestedFilename().toLowerCase()).toContain('invoice');

    await invoiceSearchInput.fill(invoiceNumber);
    invoiceRow = page.locator('tr', { hasText: invoiceNumber }).first();
    await expect(invoiceRow).toBeVisible({ timeout: 30_000 });
    await invoiceRow.getByTitle('View').click();
    await expect(page).toHaveURL(/\/invoices\/view\//);
    const invoiceId = page.url().split('/').pop();

    await page.getByLabel('User menu').click();
    await page.getByRole('banner').getByRole('button', { name: /^Sign Out$/i }).click();
    await expect(page).toHaveURL(/\/login/);

    const superAdminCredentials = getSuperAdminCredentials();
    await loginViaUi(page, superAdminCredentials);
    await deleteInvoiceViaApi(request, superAdminCredentials, invoiceId);

    await page.goto('/invoices', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('Search invoices...').first().fill(invoiceNumber);
    await expect(page.locator('tr', { hasText: invoiceNumber })).toHaveCount(0);

    await page.getByLabel('User menu').click();
    await page.getByRole('banner').getByRole('button', { name: /^Sign Out$/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
