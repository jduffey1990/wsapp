// store/company.js
import router from '@/router';
import { defineStore } from 'pinia';

export const useCompanyStore = defineStore('company', {
  state: () => ({
    company: null
  }),
  
  getters: {
    businessType: (state) => state.company?.businessType || '',
    isBrand: (state) => state.company?.businessType === 'brand',
    isRetail: (state) => state.company?.businessType === 'retail',
  },
  
  actions: {
    getCompanyData() {
      console.log('Getting company data');
    },

    setCompanyData(company) {
      this.company = company;
      localStorage.setItem('company', JSON.stringify(company));
      console.log('Company data set', company);
    },

    checkAuthCode(code) {
      console.log('AuthCode being checked', code);
    },

    async updateCompany(updates) {
      console.log('Updating compnany', updates);
    },
  },
});