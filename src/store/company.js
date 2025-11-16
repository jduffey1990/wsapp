// store/company.js
import { defineStore } from 'pinia';

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: null,
  }),
  
  getters: {
    businessType: (state) => state.company?.businessType || '',
    isBrand: (state) => state.company?.businessType === 'brand',
    isRetail: (state) => state.company?.businessType === 'retail',
  },
  
  actions: {
    /**
     * Fetch active inv invitation code for the company
     * @param {string} companyId - The company ID
     * @returns {Promise<Array>} Array of invitation code objects
     */
    async getInvitationCodes(companyId) {
      try {
        const response = await this.$companies.get(`/company-code?companyId=${companyId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching invitation codes:', error)
        throw error
      }
    },

    /**
     * Delete the active code
     * @param {Object} payload - { companyId, code }
     * @returns {Promise<Object>} The created invitation code object
     */
    async deleteThisCode(code) {
      try {
        const response = await this.$companies.delete(`/delete-code/${code}`)
        return response.data
      } catch (error) {
        console.error('Error creating invitation code:', error)
        throw error
      }
    },

    /**
     * Send an invitation email with a code
     * @param {Object} payload - { codeId, email, subject, body, image }
     * @returns {Promise<Object>} Response from email send
     */
    async sendInvitationEmail(packet) {
      try {
        const response = await this.$companies.post('/send-invitation', packet) // ← Fixed path
        return response.data
      } catch (error) {
        console.error('Error sending invitation email:', error)
        throw error
      }
    },

    /**
     * Validate an invitation code
     * @param {string} code - The invitation code to validate
     * @returns {Promise<Object>} Validation result with company info if valid
     */
    async validateInvitationCode(code) {
      const response = await this.$companies.post('/company-code/validate', { code })
      return response.data
    }
  }
});