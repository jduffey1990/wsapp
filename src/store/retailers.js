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
    
    // ✨ NEW: Filter configuration state
    filtersConfigured: localStorage.getItem('retailer-filters-configured') === 'true',
    activeFilterCategories: JSON.parse(localStorage.getItem('active-filter-categories') || '[]'),
    matchingRetailerCount: 0,
    fetchingCount: false,
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
        throw error;
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
        throw error;
      }
    },

    /**
     * ✨ NEW: Fetch count of matching retailers (for button text)
     */
    async fetchRetailerCount() {
      this.fetchingCount = true;
      
      try {
        // Build query parameters
        const params = {};
        
        // Add all active filters
        Object.keys(this.filters).forEach(key => {
          const value = this.filters[key];
          if (Array.isArray(value) && value.length > 0) {
            params[key] = value;
          } else if (value !== null && value !== undefined) {
            params[key] = value;
          }
        });

        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await this.$companiesApi.get('/retailers/count', { params });
        // this.matchingRetailerCount = response.data.count;
        
        // MOCK: Random count for now
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        this.matchingRetailerCount = Math.floor(Math.random() * 200) + 1;
        
      } catch (error) {
        console.error('Error fetching retailer count:', error);
        this.matchingRetailerCount = 0;
      } finally {
        this.fetchingCount = false;
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
     * ✨ NEW: Calculate which filter categories have active values
     */
    updateActiveFilterCategories() {
      const active = [];
      
      // Location
      if (this.filters.state?.length > 0 || this.filters.city?.length > 0) {
        active.push('location');
      }
      
      // Retailer Type
      if (this.filters.retailerType?.length > 0 || 
          this.filters.minLocations || this.filters.maxLocations) {
        active.push('retailerType');
      }
      
      // Price Point
      if (this.filters.pricePoint?.length > 0) {
        active.push('pricePoint');
      }
      
      // Target Demographics
      if (this.filters.targetGender?.length > 0 || 
          this.filters.targetAgeGroup?.length > 0 || 
          this.filters.minRating) {
        active.push('demographics');
      }
      
      // Product Categories
      if (this.filters.categories?.length > 0 || 
          this.filters.minMSRP || this.filters.maxMSRP) {
        active.push('productCategories');
      }
      
      // Aesthetic
      if (this.filters.aesthetics?.length > 0 || 
          this.filters.seasonality?.length > 0) {
        active.push('aesthetic');
      }
      
      // Financial
      if (this.filters.minRevenue || this.filters.maxRevenue) {
        active.push('financial');
      }
      
      // Buying Terms
      if (this.filters.otbStrategy?.length > 0 || 
          this.filters.minOrderSize || this.filters.maxOrderSize || 
          this.filters.paymentTerms?.length > 0) {
        active.push('buyingTerms');
      }
      
      // Operations
      if (this.filters.ediRequired !== null || this.filters.dropshipEnabled !== null) {
        active.push('operations');
      }
      
      this.activeFilterCategories = active;
      localStorage.setItem('active-filter-categories', JSON.stringify(active));
    },

    /**
     * ✨ NEW: Mark filters as configured and save to localStorage
     */
    setFiltersConfigured(value) {
      this.filtersConfigured = value;
      localStorage.setItem('retailer-filters-configured', value.toString());
      
      if (value) {
        this.updateActiveFilterCategories();
      }
    },

    /**
     * ✨ NEW: Reset filter configuration (return to filter configuration page)
     */
    resetFilterConfiguration() {
      this.filtersConfigured = false;
      this.activeFilterCategories = [];
      localStorage.removeItem('retailer-filters-configured');
      localStorage.removeItem('active-filter-categories');
    },

    /**
     * Clear the store
     */
    clearStore() {
      this.$reset();
    }
  }
});