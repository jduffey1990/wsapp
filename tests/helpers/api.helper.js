// tests/helpers/api.helper.js

/**
 * API Base URLs (from your Docker setup)
 */
export const API_URLS = {
  USERS: 'http://localhost:3001',
  COMPANIES: 'http://localhost:3003',
  VERIFY: 'http://localhost:3002',
};

/**
 * Helper functions for API interactions in E2E tests
 */

/**
 * Mock API response
 */
export async function mockApiResponse(page, url, response, status = 200) {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for API call and capture request
 */
export async function waitForApiCall(page, url) {
  return await page.waitForRequest(
    (request) => request.url().includes(url),
    { timeout: 10000 }
  );
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page, url) {
  return await page.waitForResponse(
    (response) => response.url().includes(url),
    { timeout: 10000 }
  );
}

/**
 * Intercept and verify API call
 */
export async function interceptApiCall(page, url, method, callback) {
  const requests = [];
  
  await page.route(url, (route, request) => {
    if (request.method() === method) {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData(),
        headers: request.headers(),
      });
    }
    route.continue();
  });
  
  if (callback) {
    await callback();
  }
  
  return requests;
}