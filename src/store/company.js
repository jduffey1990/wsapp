// store/company.js
import { defineStore } from 'pinia';

export const useCompanyStore = defineStore('company', {
  state: () => ({
    // Initialize directly from localStorage (like user store)
    company: JSON.parse(localStorage.getItem('company')) || null,
    products: JSON.parse(localStorage.getItem('companyProducts')) || [],
  }),
  
  getters: {
    // Company getters
    companyId: (state) => state.company?.id || null,
    companyName: (state) => state.company?.name || '',
    companyProfile: (state) => state.company?.profile || null,
    isProfileVerified: (state) => state.company?.profile?.verified || false,
    completionScore: (state) => state.company?.profile?.completionScore || 0,
    
    // Profile section getters
    coreIdentity: (state) => state.company?.profile?.coreIdentity || {},
    marketPositioning: (state) => state.company?.profile?.marketPositioning || {},
    wholesaleOperations: (state) => state.company?.profile?.wholesaleOperations || {},
    operations: (state) => state.company?.profile?.operations || {},
    brandStyle: (state) => state.company?.profile?.brandStyle || {},
    socialMedia: (state) => state.company?.profile?.socialMedia || {},
    
    // Product getters
    activeProducts: (state) => state.products.filter(p => p.status === 'active'),
  },
  
  actions: {
    // ============== COMPANY ACTIONS ==============
    
    /**
     * Set company data and persist to localStorage
     */
    setCompanyData(company) {
      this.company = company;
      localStorage.setItem('company', JSON.stringify(company));
    },
    
    /**
     * Clear company data (call on logout)
     */
    clearCompanyCache() {
      this.company = null;
      this.products = [];
      localStorage.removeItem('company');
      localStorage.removeItem('companyProducts');
    },
    
    /**
     * Fetch company by ID with smart caching
     * @param {string} companyId - The company ID
     * @param {boolean} forceRefresh - Force API call even if cached
     * @returns {Promise<Object>} Company object
     */
    async fetchCompany(companyId, forceRefresh = false) {
      // Return cached if available and not forcing refresh
      if (!forceRefresh && this.company?.id === companyId) {
        console.log('✅ Using cached company data');
        return this.company;
      }
      
      try {
        const response = await this.$companiesApi.get(`/get-company?id=${companyId}`);
        this.setCompanyData(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching company:', error);
        throw error;
      }
    },

    /**
     * Update company main table
     * @param {string} companyId - The company ID
     * @param {Object} profileUpdates - Profile fields to update
     * @returns {Promise<Object>} Updated company
     */
    async updateCompany(companyId, companyUpdates) {
      try {
        const response = await this.$companiesApi.patch('/edit-company', {
          companyId,
          update: companyUpdates
        });
        
        this.setCompanyData(response.data);
        return response.data;
      } catch (error) {
        console.error('Error updating company profile:', error);
        throw error;
      }
    },
    
    /**
     * Update company profile
     * @param {string} companyId - The company ID
     * @param {Object} profileUpdates - Profile fields to update
     * @returns {Promise<Object>} Updated company
     */
    async updateCompanyProfile(companyId, profileUpdates) {
      try {
        const response = await this.$companiesApi.patch('/edit-company-profile', {
          companyId,
          profile: profileUpdates
        });
        
        this.setCompanyData(response.data);
        return response.data;
      } catch (error) {
        console.error('Error updating company profile:', error);
        throw error;
      }
    },
    
    // /**
    //  * Mark company profile as verified (call after wizard completion)
    //  * @param {string} companyId - The company ID
    //  * @returns {Promise<Object>} Updated company
    //  */
    // async markCompanyAsVerified(companyId) {
    //   try {
    //     const response = await this.$companiesApi.post(`/companies/${companyId}/verify`);
    //     this.setCompanyData(response.data);
    //     return response.data;
    //   } catch (error) {
    //     console.error('Error marking company as verified:', error);
    //     throw error;
    //   }
    // },
    
    /**
     * Creation of a company through userfacing app
     * @param {object} companyData - The company data
     * @returns {Promise<Object>} Company object
     */
    async createCompany(companyData) {
      const response = await this.$companiesApi.post('/create-company-with-user', companyData);
      this.setCompanyData(response.data.company);
      return response.data;
    },
    
    /**
     * Fetch active invitation code for the company
     * @param {string} companyId - The company ID
     * @returns {Promise<Object>} Invitation code object
     */
    async getInvitationCodes(companyId) {
      try {
        const response = await this.$companiesApi.get(`/company-code?companyId=${companyId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching invitation codes:', error);
        throw error;
      }
    },

    /**
     * Delete the active code
     * @param {string} code - The invitation code to delete
     * @returns {Promise<Object>} Response data
     */
    async deleteThisCode(code) {
      try {
        const response = await this.$companiesApi.delete(`/delete-code/${code}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting invitation code:', error);
        throw error;
      }
    },

    /**
     * Send an invitation email with a code
     * @param {Object} packet - { code, email, subject, body, image }
     * @returns {Promise<Object>} Response from email send
     */
    async sendInvitationEmail(packet) {
      try {
        const response = await this.$companiesApi.post('/send-invitation', packet);
        return response.data;
      } catch (error) {
        console.error('Error sending invitation email:', error);
        throw error;
      }
    },

    /**
     * Validate an invitation code
     * @param {string} code - The invitation code to validate
     * @returns {Promise<string>} Company ID if valid
     */
    async validateInvitationCode(code) {
      const response = await this.$companiesApi.post('/company-code/validate', { code });
      return response.data;
    },

    // ============== PRODUCT ACTIONS ==============
    
    /**
     * Fetch all products for a company with smart caching
     * @param {string} companyId - The company ID
     * @param {boolean} activeOnly - Only fetch active products
     * @param {boolean} forceRefresh - Force API call even if cached
     * @returns {Promise<Array>} Array of products
     */
    async fetchProducts(companyId, activeOnly = false, forceRefresh = false) {
      // Return cached if available and not forcing refresh
      if (!forceRefresh && this.products.length > 0) {
        console.log('✅ Using cached products data');
        return activeOnly ? this.activeProducts : this.products;
      }
      
      try {
        const response = await this.$companiesApi.get('/products', {
          params: { companyId, activeOnly }
        });
        this.products = response.data;
        localStorage.setItem('companyProducts', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },

    /**
     * Get a single product by ID
     * @param {string} productId - The product ID
     * @returns {Promise<Object>} Product object
     */
    async getProduct(productId) {
      // Check cache first
      const cached = this.products.find(p => p.id === productId);
      if (cached) {
        console.log('✅ Using cached product data');
        return cached;
      }
      
      try {
        const response = await this.$companiesApi.get(`/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },

    /**
     * Create a new product
     * @param {Object} productData - Product data (must include companyId and name)
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
      try {
        const response = await this.$companiesApi.post('/products', productData);
        
        // Add to cache
        this.products.unshift(response.data);
        localStorage.setItem('companyProducts', JSON.stringify(this.products));
        
        return response.data;
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },

    /**
     * Update an existing product
     * @param {string} productId - The product ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(productId, updates) {
      try {
        const response = await this.$companiesApi.patch(`/products/${productId}`, updates);
        
        // Update cache
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index] = response.data;
          localStorage.setItem('companyProducts', JSON.stringify(this.products));
        }
        
        return response.data;
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },

    /**
     * Delete a product (soft delete)
     * @param {string} productId - The product ID
     * @returns {Promise<void>}
     */
    async deleteProduct(productId) {
      try {
        await this.$companiesApi.delete(`/products/${productId}`);
        
        // Remove from cache
        this.products = this.products.filter(p => p.id !== productId);
        localStorage.setItem('companyProducts', JSON.stringify(this.products));
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    },

    /**
     * Search products by attributes
     * @param {string} companyId - The company ID
     * @param {Object} attributes - Attributes to search for
     * @returns {Promise<Array>} Matching products
     */
    async searchProducts(companyId, attributes) {
      try {
        const response = await this.$companiesApi.post('/products/search', {
          companyId,
          attributes
        });
        return response.data;
      } catch (error) {
        console.error('Error searching products:', error);
        throw error;
      }
    },

    /**
     * Get products by category
     * @param {string} companyId - The company ID
     * @param {string} category - Category to filter by
     * @returns {Promise<Array>} Products in category
     */
    async getProductsByCategory(companyId, category) {
      try {
        const response = await this.$companiesApi.get(`/products/category/${category}`, {
          params: { companyId }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }
    },
  }
});