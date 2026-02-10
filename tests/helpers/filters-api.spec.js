// tests/helpers/filters-api.spec.js
import { test, expect } from '@playwright/test';
import { API_URLS } from './api.helper';

const USERS_API = API_URLS.USERS;

test.describe('Filters API Integration', () => {
  let authToken;
  let userId;

  test.beforeAll(async ({ request }) => {
    // Create test user via your Docker users service
    const response = await request.post(`${USERS_API}/create-test-user`, {
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'API Test User',
        captchaToken: 'test-token', // May need to adjust based on your setup
      },
    });

    const data = await response.json();

    
    expect(response.ok()).toBeTruthy();
    authToken = data.token;
    userId = data.user.id;
  });

  test('GET /users/:userId/filters - returns default filters for new user', async ({ request }) => {
    const response = await request.get(`${USERS_API}/users/${userId}/filters`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toMatchObject({
      userId: userId,
      configured: false,
      activeCategories: [],
      filters: {},
    });

    expect(data.createdAt).toBeTruthy();
    expect(data.updatedAt).toBeTruthy();
  });

  test('PUT /users/:userId/filters - updates filters successfully', async ({ request }) => {
    const updatePayload = {
      configured: true,
      activeCategories: ['location', 'demographics'],
      filters: {
        state: ['CA', 'NY'],
        targetGender: ['women'],
        minRating: 4,
      },
    };

    const response = await request.put(`${USERS_API}/users/${userId}/filters`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: updatePayload,
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.configured).toBe(true);
    expect(data.activeCategories).toEqual(['location', 'demographics']);
    expect(data.filters.state).toEqual(['CA', 'NY']);
    expect(data.filters.targetGender).toEqual(['women']);
    expect(data.filters.minRating).toBe(4);
  });

  test('PUT /users/:userId/filters - merges filters on partial update', async ({ request }) => {
    // First update
    await request.put(`${USERS_API}/users/${userId}/filters`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        filters: {
          state: ['CA'],
          targetGender: ['women'],
        },
      },
    });

    // Second update (partial)
    const response = await request.put(`${USERS_API}/users/${userId}/filters`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        filters: {
          state: ['NY'],
          pricePoint: ['premium'],
        },
      },
    });

    const data = await response.json();

    expect(data.filters.state).toEqual(['NY']);
    expect(data.filters.targetGender).toEqual(['women']);
    expect(data.filters.pricePoint).toEqual(['premium']);
  });

  test('PATCH /users/:userId/filters/reset - resets filters to defaults', async ({ request }) => {
    // First, set some filters
    await request.put(`${USERS_API}/users/${userId}/filters`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        configured: true,
        activeCategories: ['location'],
        filters: { state: ['CA'] },
      },
    });

    // Reset
    const response = await request.patch(`${USERS_API}/users/${userId}/filters/reset`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.configured).toBe(false);
    expect(data.activeCategories).toEqual([]);
    expect(data.filters).toEqual({});
  });

  test('GET /users/:userId/filters - denies access to other user filters', async ({ request }) => {
    const otherUserId = '00000000-0000-0000-0000-000000000000';

    const response = await request.get(`${USERS_API}/users/${otherUserId}/filters`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status()).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('PUT /users/:userId/filters - requires authentication', async ({ request }) => {
    const response = await request.put(`${USERS_API}/users/${userId}/filters`, {
      data: {
        configured: true,
        activeCategories: ['location'],
      },
    });

    expect(response.status()).toBe(401);
  });
});