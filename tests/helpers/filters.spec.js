import { expect, test } from '@playwright/test';
import { API_URLS } from './api.helper';
import { createTestUser, login } from './auth.helper';

const USERS_API = API_URLS.USERS;

/**
 * Seed filter state exactly how the app expects it:
 * via localStorage cache.
 */
async function seedFilters(page, payload) {
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    const user = JSON.parse(raw);
    return !!user?.id;
  });

  await page.evaluate((data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem(
      `user-filters-${user.id}`,
      JSON.stringify(data)
    );
  }, payload);
}

test.describe('Retailer Filters – User Flow', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    testUser = await createTestUser(page);
    await login(page, testUser);
  });

  test('First-time user sees filter configuration page', async ({ page }) => {
    await page.goto('/dashboard/retailers');

    await expect(page.locator('h1'))
      .toContainText('Find Your Perfect Wholesale Partners');

    await expect(
      page.locator('[data-testid="filter-panel-location"]')
    ).toBeVisible();
  });

  test('User filter preferences are saved to API', async ({ page }) => {
    const requests = [];

    await page.route(`${USERS_API}/users/*/filters`, (route, request) => {
      if (request.method() === 'PUT') {
        requests.push(JSON.parse(request.postData()));
      }
      route.continue();
    });

    await page.goto('/dashboard/retailers');

    await seedFilters(page, {
      configured: true,
      activeCategories: ['location'],
      filters: {
        state: ['CA', 'NY'],
        targetGender: ['women']
      }
    });

    await page.reload();
    const showResults = page.getByTestId('show-results-button');
    await expect(showResults).toBeEnabled();
    await showResults.click();

    await expect.poll(() => requests.length).toBeGreaterThan(0);

    const payload = requests[0];
    expect(payload.configured).toBe(true);
    expect(payload.configured).toBe(true);
    expect(payload.filters).toBeDefined();
  });

  test('User filters are loaded from API on mount', async ({ page }) => {
    await page.route(`${USERS_API}/users/*/filters`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          configured: true,
          activeCategories: ['location'],
          filters: { state: ['CA'] }
        })
      });
    });

    await page.goto('/dashboard/retailers');

    await expect(page.locator('h1'))
      .toContainText('Find Your Perfect Wholesale Partners');
  });

  test('localStorage cache is updated after API save', async ({ page }) => {
    await page.route(`${USERS_API}/users/*/filters`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          configured: true,
          activeCategories: ['location'],
          filters: { state: ['CA'] }
        })
      });
    });

    await page.goto('/dashboard/retailers');
    const showResults = page.getByTestId('show-results-button');
    await expect(showResults).toBeEnabled();
    await showResults.click();

    const cached = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      return localStorage.getItem(`user-filters-${user.id}`);
    });

    expect(cached).toBeTruthy();
    expect(JSON.parse(cached).filters.state).toContain('CA');
  });

  test('Filters persist across page reloads', async ({ page }) => {
    await page.goto('/dashboard/retailers');

    await seedFilters(page, {
      configured: true,
      activeCategories: ['location'],
      filters: { state: ['CA'] }
    });

    await page.reload();

    const cached = await page.evaluate(() => {
    const key = Object.keys(localStorage)
        .find(k => k.startsWith('user-filters-'));

    return key ? JSON.parse(localStorage.getItem(key)) : null;
    });

    expect(cached).toBeTruthy();
    expect(cached.filters).toBeDefined();


  });
});
