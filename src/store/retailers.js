// src/store/retailers.js

import { defineStore } from 'pinia';

export const useRetailersStore = defineStore('retailers', {
  state: () => ({
    // Data
    retailers: [],
    currentRetailer: null,
    filterOptions: {
    //   regions: [],
      states: [],
      retailerTypes: [],
      pricePoints: [],
      categories: [],
      aesthetics: [],
      otbStrategies: [],
      paymentTerms: []
    },
    
    // Active filters
    filters: {
      region: [],
      state: [],
      city: [],
      retailerType: [],
      minLocations: null,
      maxLocations: null,
      pricePoint: [],
      targetGender: [],
      targetAgeGroup: [],
      minRating: null,
      categories: [],
      minMSRP: null,
      maxMSRP: null,
      aesthetics: [],
      seasonality: [],
      minRevenue: null,
      maxRevenue: null,
      otbStrategy: [],
      minOrderSize: null,
      maxOrderSize: null,
      paymentTerms: [],
      ediRequired: null,
      dropshipEnabled: null,
    },
    
    // Search & pagination
    searchQuery: '',
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    },
    sortBy: 'businessName',
    sortOrder: 'asc',
    
    // UI state
    loading: false,
    filterOptionsLoading: false,
    error: null,
  }),

  getters: {
    hasActiveFilters: (state) => {
      return Object.values(state.filters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined;
      }) || state.searchQuery !== '';
    },
    
    activeFilterCount: (state) => {
      let count = 0;
      Object.values(state.filters).forEach(value => {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (value !== null && value !== undefined) count++;
      });
      if (state.searchQuery) count++;
      return count;
    }
  },

  actions: {
    /**
     * Fetch retailers with current filters
     */
    async fetchRetailers(resetPage = false) {
      this.loading = true;
      this.error = null;
      
      if (resetPage) {
        this.pagination.page = 1;
      }

      try {
        // Build query parameters
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        };

        // Add search
        if (this.searchQuery) {
          params.search = this.searchQuery;
        }

        // Add all active filters
        Object.keys(this.filters).forEach(key => {
          const value = this.filters[key];
          if (Array.isArray(value) && value.length > 0) {
            params[key] = value;
          } else if (value !== null && value !== undefined) {
            params[key] = value;
          }
        });

        const response = await this.$companiesApi.get('/retailers', { params });
        
        this.retailers = response.data.retailers;
        this.pagination = response.data.pagination;

      } catch (error) {
        console.error('Error fetching retailers:', error);
        this.error = error.response?.data?.error || 'Failed to load retailers';
        throw error; // Re-throw so component can handle it
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch filter options for dropdowns
     */
    async fetchFilterOptions() {
      this.filterOptionsLoading = true;
      
      try {
        const response = await this.$companiesApi.get('/retailers/filter-options/all');
        this.filterOptions = response.data;
      } catch (error) {
        console.error('Error fetching filter options:', error);
        throw error;
      } finally {
        this.filterOptionsLoading = false;
      }
    },

    /**
     * Fetch single retailer by ID
     */
    async fetchRetailer(id) {
      try {
        const response = await this.$companiesApi.get(`/retailers/${id}`);
        this.currentRetailer = response.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching retailer:', error);
        throw error; // Re-throw so component can handle it
      }
    },

    /**
     * Update a single filter and refresh results
     */
    async updateFilter(filterName, value) {
      this.filters[filterName] = value;
      await this.fetchRetailers(true); // Reset to page 1
    },

    /**
     * Update search and refresh
     */
    async updateSearch(query) {
      this.searchQuery = query;
      await this.fetchRetailers(true);
    },

    /**
     * Go to specific page
     */
    async goToPage(page) {
      this.pagination.page = page;
      await this.fetchRetailers();
    },

    /**
     * Change items per page
     */
    async changeLimit(limit) {
      this.pagination.limit = limit;
      await this.fetchRetailers(true);
    },

    /**
     * Update sort
     */
    async updateSort(sortBy, sortOrder = 'asc') {
      this.sortBy = sortBy;
      this.sortOrder = sortOrder;
      await this.fetchRetailers(true);
    },

    /**
     * Reset all filters
     */
    async resetFilters() {
      this.filters = {
        region: [],
        state: [],
        city: [],
        retailerType: [],
        minLocations: null,
        maxLocations: null,
        pricePoint: [],
        targetGender: [],
        targetAgeGroup: [],
        minRating: null,
        categories: [],
        minMSRP: null,
        maxMSRP: null,
        aesthetics: [],
        seasonality: [],
        minRevenue: null,
        maxRevenue: null,
        otbStrategy: [],
        minOrderSize: null,
        maxOrderSize: null,
        paymentTerms: [],
        ediRequired: null,
        dropshipEnabled: null,
      };
      this.searchQuery = '';
      await this.fetchRetailers(true);
    },

    /**
     * Clear the store
     */
    clearStore() {
      this.$reset();
    }
  }
});