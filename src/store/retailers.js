// src/store/retailers.js
import { defineStore } from 'pinia';
import { useUserStore } from './user';

export const useRetailersStore = defineStore('retailers', {
  state: () => ({
    retailers: [],
    currentRetailer: null,
    filterOptions: {
      states: [],
      retailerTypes: [],
      pricePoints: [],
      categories: [],
      aesthetics: [],
      otbStrategies: [],
      paymentTerms: []
    },
    
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
    
    searchQuery: '',
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    },
    sortBy: 'businessName',
    sortOrder: 'asc',
    
    loading: false,
    filterOptionsLoading: false,
    error: null,
    
    filtersConfigured: false,
    activeFilterCategories: [],
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
      return count;
    },
  },

  actions: {
    // ============== FILTER API METHODS ==============
    
    hydrateFilters(incoming = {}) {
      Object.keys(this.filters).forEach(key => {
        if (incoming[key] !== undefined) {
          this.filters[key] = incoming[key];
        }
      });
    },
    
    async fetchFilters() {
      const userStore = useUserStore();
      const userId = userStore.user?.id;
      if (!userId) return;

      try {
        const response = await this.$usersApi.get(`/users/${userId}/filters`);
        const { configured, activeCategories, filters } = response.data;
        
        this.filtersConfigured = configured;
        this.activeFilterCategories = activeCategories;
        this.hydrateFilters(filters);
        
        localStorage.setItem(`user-filters-${userId}`, JSON.stringify({
          configured, activeCategories, filters
        }));
      } catch (error) {
        console.error('Error fetching filters:', error);
        const cached = localStorage.getItem(`user-filters-${userId}`);
        if (cached) {
          const data = JSON.parse(cached);
          this.filtersConfigured = data.configured || false;
          this.activeFilterCategories = data.activeCategories || [];
          this.hydrateFilters(data.filters);
        }
      }
    },

    async saveFilters() {
      const userStore = useUserStore();
      const userId = userStore.user?.id;
      if (!userId) throw new Error('No user ID');

      try {
        const response = await this.$usersApi.put(`/users/${userId}/filters`, {
          configured: this.filtersConfigured,
          activeCategories: this.activeFilterCategories,
          filters: this.filters
        });
        
        const { configured, activeCategories, filters } = response.data;
        this.filtersConfigured = configured;
        this.activeFilterCategories = activeCategories;
        this.hydrateFilters(filters);
        
        localStorage.setItem(`user-filters-${userId}`, JSON.stringify({
          configured, activeCategories, filters
        }));
      } catch (error) {
        console.error('Error saving filters:', error);
        throw error;
      }
    },

    async setFiltersConfigured(value) {
      this.filtersConfigured = value;
      if (value) this.updateActiveFilterCategories();
      await this.saveFilters();
    },

    async resetFilterConfiguration() {
      const userStore = useUserStore();
      const userId = userStore.user?.id;
      if (!userId) throw new Error('No user ID');

      try {
        const response = await this.$usersApi.patch(`/users/${userId}/filters/reset`);
        const { configured, activeCategories, filters } = response.data;
        
        this.filtersConfigured = configured;
        this.activeFilterCategories = activeCategories;
        this.hydrateFilters(filters);
        
        localStorage.setItem(`user-filters-${userId}`, JSON.stringify({
          configured, activeCategories, filters
        }));
      } catch (error) {
        console.error('Error resetting filters:', error);
        throw error;
      }
    },

    updateActiveFilterCategories() {
      const active = [];
      
      if (this.filters.state?.length > 0 || this.filters.city?.length > 0) {
        active.push('location');
      }
      if (this.filters.retailerType?.length > 0 || this.filters.minLocations || this.filters.maxLocations) {
        active.push('retailerType');
      }
      if (this.filters.pricePoint?.length > 0) {
        active.push('pricePoint');
      }
      if (this.filters.targetGender?.length > 0 || this.filters.targetAgeGroup?.length > 0 || this.filters.minRating) {
        active.push('demographics');
      }
      if (this.filters.categories?.length > 0 || this.filters.minMSRP || this.filters.maxMSRP) {
        active.push('productCategories');
      }
      if (this.filters.aesthetics?.length > 0 || this.filters.seasonality?.length > 0) {
        active.push('aesthetic');
      }
      if (this.filters.minRevenue || this.filters.maxRevenue) {
        active.push('financial');
      }
      if (this.filters.otbStrategy?.length > 0 || this.filters.minOrderSize || this.filters.maxOrderSize || this.filters.paymentTerms?.length > 0) {
        active.push('buyingTerms');
      }
      if (this.filters.ediRequired !== null || this.filters.dropshipEnabled !== null) {
        active.push('operations');
      }
      
      this.activeFilterCategories = active;
    },

    // ============== YOUR EXISTING METHODS ==============
    
    async fetchRetailers(resetPage = false) {
      this.loading = true;
      this.error = null;
      if (resetPage) this.pagination.page = 1;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        };

        if (this.searchQuery) params.search = this.searchQuery;

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

    async fetchFilterOptions() {
      this.filterOptionsLoading = true;
      
      this.filterOptions = {
        aesthetics: [
          'Athleisure',
          'Boho',
          'Classic',
          'Contemporary',
          'Edgy',
          'Minimalist',
          'Preppy',
          'Romantic',
          'Streetwear',
          'Vintage'
        ],
        categories: [
          'Accessories',
          'Activewear',
          'Basics',
          'Denim',
          'Handbags',
          'Home Goods',
          'Intimates',
          'Jewelry',
          'Outerwear',
          'Shoes',
          'Sleepwear',
          'Swimwear'
        ],
        otbStrategies: [
          'Forward Buy',
          'In Season',
          'Just In Time',
          'Mixed',
          'Prebook'
        ],
        paymentTerms: [
          'COD',
          'Credit Card',
          'Net30',
          'Net60',
          'Net90',
          'Prepay'
        ],
        pricePoints: [
          'Luxury/Designer',
          'Mass Market',
          'Mid-Tier',
          'Premium',
          'Value/Discount'
        ],
        regions: [
          'Midwest',
          'Northeast',
          'Pacific Northwest',
          'Southeast',
          'Southwest',
          'West'
        ],
        retailerTypes: [
          'Big-Box Discount',
          'Boutique',
          'Concept Store',
          'Department Store',
          'E-Commerce Only',
          'Fashion Boutique',
          'Lifestyle Store',
          'Outdoor Recreation',
          'Specialty Chain',
          'Sporting Goods'
        ],
        states: [
          'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]
      };
      
      this.filterOptionsLoading = false;
    },

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

    async fetchRetailerPreviewCount() {
      this.fetchingCount = true;
      try {
        const params = {};
        Object.keys(this.filters).forEach(key => {
          const value = this.filters[key];
          if (Array.isArray(value) && value.length > 0) {
            params[key] = value;
          } else if (value !== null && value !== undefined) {
            params[key] = value;
          }
        });

        await new Promise(resolve => setTimeout(resolve, 300));
        this.matchingRetailerCount = Math.floor(Math.random() * 200) + 1;
      } catch (error) {
        console.error('Error fetching retailer count:', error);
        this.matchingRetailerCount = 0;
      } finally {
        this.fetchingCount = false;
      }
    },

    updateFilter(filterKey, value) {
      this.filters[filterKey] = value;
    },

    async updateSearch(query) {
      this.searchQuery = query;
      await this.fetchRetailers(true);
    },

    async goToPage(page) {
      this.pagination.page = page;
      await this.fetchRetailers();
    },

    async changeLimit(limit) {
      this.pagination.limit = limit;
      await this.fetchRetailers(true);
    },

    async updateSort(sortBy, sortOrder = 'asc') {
      this.sortBy = sortBy;
      this.sortOrder = sortOrder;
      await this.fetchRetailers(true);
    },

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
      await this.saveFilters();
      await this.fetchRetailers(true);
    },

    clearStore() {
      this.$reset();
    }
  }
});