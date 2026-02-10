// tests/helpers/auth.helper.js
import { API_URLS } from './api.helper.js';
import { randomUUID } from 'crypto';


const USERS_API = API_URLS.USERS;

/**
 * Create a test user account via API (bypasses UI and CAPTCHA)
 * @param {import('@playwright/test').Page} page
 * @param {Object} userData
 */
export async function createTestUser(page, userData = {}) {
  const email = `test-${randomUUID()}@example.com`;

  const response = await page.request.post(`${USERS_API}/create-test-user`, {
    data: { email, password: 'TestPassword123!', name: 'Test User' },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test user`);
  }

  const data = await response.json();

  // 👇 Inject storage before navigation
  await page.context().addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token: data.token, user: data.user });

  return data;
}

/**
 * Login as a test user
 * User is already authenticated via createTestUser, just navigate to dashboard
 * @param {import('@playwright/test').Page} page
 * @param {Object} credentials
 */
export async function login(page) {
  await page.goto('/dashboard');
}

/**
 * Logout current user
 */
export async function logout(page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL(/\/login/);
}

/**
 * Get stored auth token from localStorage
 */
export async function getAuthToken(page) {
  return await page.evaluate(() => localStorage.getItem('token'));
}

/**
 * Set auth token in localStorage
 */
export async function setAuthToken(page, token, user) {
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });
}