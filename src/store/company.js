// store/company.js
import { defineStore } from 'pinia';

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: null,
    products: [], // Cache products for the company
  }),
  
  getters: {
    businessType: (state) => state.company?.businessType || '',
    isBrand: (state) => state.company?.businessType === 'brand',
    isRetail: (state) => state.company?.businessType === 'retail',
    activeProducts: (state) => state.products.filter(p => p.status === 'active'),
  },
  
  actions: {
    // ============== COMPANY ACTIONS ==============
    
    /**
     * Creation of a company through userfacing app
     * @param {object} companyData - The company data
     * @returns {Promise<Object>} Company object
     */
    async createCompany(companyData) {
      const response = await this.$companiesApi.post('/create-company-with-user', companyData);
      this.company = response.data.company;
      return response.data;
    },
    
    /**
     * Fetch active invitation code for the company
     * @param {string} companyId - The company ID
     * @returns {Promise<Object>} Invitation code object
     */
    async getInvitationCodes(companyId) {
      try {
        const response = await this.$companiesApi.get(`/company-code?companyId=${companyId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching invitation codes:', error)
        throw error
      }
    },

    /**
     * Delete the active code
     * @param {string} code - The invitation code to delete
     * @returns {Promise<Object>} Response data
     */
    async deleteThisCode(code) {
      try {
        const response = await this.$companiesApi.delete(`/delete-code/${code}`)
        return response.data
      } catch (error) {
        console.error('Error deleting invitation code:', error)
        throw error
      }
    },

    /**
     * Send an invitation email with a code
     * @param {Object} packet - { code, email, subject, body, image }
     * @returns {Promise<Object>} Response from email send
     */
    async sendInvitationEmail(packet) {
      try {
        const response = await this.$companiesApi.post('/send-invitation', packet)
        return response.data
      } catch (error) {
        console.error('Error sending invitation email:', error)
        throw error
      }
    },

    /**
     * Validate an invitation code
     * @param {string} code - The invitation code to validate
     * @returns {Promise<string>} Company ID if valid
     */
    async validateInvitationCode(code) {
      const response = await this.$companiesApi.post('/company-code/validate', { code })
      return response.data
    },

    // ============== PRODUCT ACTIONS ==============
    
    /**
     * Fetch all products for a company
     * @param {string} companyId - The company ID
     * @param {boolean} activeOnly - Only fetch active products
     * @returns {Promise<Array>} Array of products
     */
    async fetchProducts(companyId, activeOnly = false) {
      try {
        const response = await this.$companiesApi.get('/products', {
          params: { companyId, activeOnly }
        })
        this.products = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching products:', error)
        throw error
      }
    },

    /**
     * Get a single product by ID
     * @param {string} productId - The product ID
     * @returns {Promise<Object>} Product object
     */
    async getProduct(productId) {
      try {
        const response = await this.$companiesApi.get(`/products/${productId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching product:', error)
        throw error
      }
    },

    /**
     * Create a new product
     * @param {Object} productData - Product data (must include companyId and name)
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
      try {
        const response = await this.$companiesApi.post('/products', productData)
        // Add to local cache
        this.products.unshift(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating product:', error)
        throw error
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
        const response = await this.$companiesApi.patch(`/products/${productId}`, updates)
        // Update in local cache
        const index = this.products.findIndex(p => p.id === productId)
        if (index !== -1) {
          this.products[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating product:', error)
        throw error
      }
    },

    /**
     * Delete a product (soft delete)
     * @param {string} productId - The product ID
     * @returns {Promise<void>}
     */
    async deleteProduct(productId) {
      try {
        await this.$companiesApi.delete(`/products/${productId}`)
        // Remove from local cache
        this.products = this.products.filter(p => p.id !== productId)
      } catch (error) {
        console.error('Error deleting product:', error)
        throw error
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
        })
        return response.data
      } catch (error) {
        console.error('Error searching products:', error)
        throw error
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
        })
        return response.data
      } catch (error) {
        console.error('Error fetching products by category:', error)
        throw error
      }
    },
  }
});