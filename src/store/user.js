// store/user.js
import router from '@/router';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    company: JSON.parse(localStorage.getItem('company')) || null,
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user?.email,
    businessType: (state) => state.user?.businessType || '',
    isBrand: (state) => state.user?.businessType === 'brand',
    isRetail: (state) => state.user?.businessType === 'retail',
  },
  
  actions: {
    /**
     * Decode JWT to extract payload (including expiration)
     */
    decodeToken(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    },

    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      // exp is in seconds, Date.now() is in milliseconds
      return decoded.exp * 1000 < Date.now();
    },

    /**
     * Set auth data and persist to localStorage
     */
    setAuthData(token, user) {
      this.token = token;
      this.user = user;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set authorization headers
      this.$users.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      this.$businessVerification.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      this.$companies.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    /**
     * Clear auth data
     */
    clearAuth() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete this.$users.defaults.headers.common['Authorization'];
      delete this.$businessVerification.defaults.headers.common['Authorization'];
      delete this.$companies.defaults.headers.common['Authorization'] 
    },

    setBusinessType(type) {
      if (!this.user) this.user = {};
      this.user.businessType = type;
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    async login(credentials) {
      try {
        const response = await this.$users.post('/login', credentials);
        const { token, user } = response.data;
        
        this.setAuthData(token, user);
        return user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async createUser(userData) {
      const response = await this.$users.post('/create-user', userData)
      return response.data
    },

    /**
     * ✅ Smart session check - only calls API if needed
     */
    async getSession() {
      // No token? Clear and return
      if (!this.token) {
        this.clearAuth();
        return;
      }

      // ✅ Check if token is expired
      if (this.isTokenExpired(this.token)) {
        console.log('Token expired, clearing auth');
        this.clearAuth();
        return;
      }

      // ✅ Token is valid and we have cached user data
      if (this.user && this.user.email) {
        console.log('✅ Using cached user data, token still valid');
        
        // Set headers for authenticated requests
        this.$users.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.$businessVerification.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.$companies.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        return; // ✅ No API call needed!
      }

      // Token valid but no user data cached - fetch from server
      try {
        this.$users.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        const response = await this.$users.get('/session');
        const { user } = response.data;
        
        // Update cache
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        
        this.$businessVerification.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.$companies.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Session validation failed:', error);
        this.clearAuth();
      }
    },

    async updateUser(updates) {
      console.log('Updating user with:', updates);
      try {  
        // Call the backend endpoint
        const response = await this.$users.patch('/edit-user', updates)
        
        // Update the local user state with the returned data
        if (response.data) {
          this.user = response.data
        }

        console.log('User updated successfully:', response.data);
        
        return response.data
      } catch (error) {
        console.error('Update user error:', error)
        throw error
      }
    },
    async sendActivateEmail(email) {
      try {
        const response = await this.$users.post(`/send-activation/${email}`)
        return response.data
      } catch (error) {
        console.error('Error sending invitation email:', error)
        throw error
      }
    },
    async logout() {
      try {
        await this.$users.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      this.clearAuth();
      router.push('/login');
    },
  },
});