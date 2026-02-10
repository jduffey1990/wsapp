// e2e/fixtures/filters.fixture.js

/**
 * Reusable test data and fixtures
 */

export const MOCK_FILTERS = {
  basic: {
    configured: true,
    activeCategories: ['location'],
    filters: {
      state: ['CA'],
    },
  },

  complex: {
    configured: true,
    activeCategories: ['location', 'demographics', 'pricePoint', 'financial'],
    filters: {
      state: ['CA', 'NY', 'TX'],
      city: ['Los Angeles', 'New York'],
      targetGender: ['women', 'men'],
      targetAgeGroup: ['18-24', '25-34'],
      pricePoint: ['premium', 'luxury'],
      minRevenue: 1000000,
      maxRevenue: 10000000,
    },
  },

  empty: {
    configured: false,
    activeCategories: [],
    filters: {},
  },
};

export const FILTER_CATEGORIES = [
  'location',
  'retailerType',
  'pricePoint',
  'demographics',
  'productCategories',
  'aesthetic',
  'financial',
  'buyingTerms',
  'operations',
];