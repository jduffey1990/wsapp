import router from '@/router';
import {defineStore} from 'pinia';

import {useCookies} from 'vue3-cookies';



export const useUserStore = defineStore('user', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        llmCache: {}
    }),
    getters: {
        isLoggedIn: (state) => !!state.user.email,
        businessType: (state) => state.user?.businessType || '',
        isBrand: (state) => state.user?.businessType === 'brand',
        isRetail: (state) => state.user?.businessType === 'retail',
    },
    actions: {
        getCachedResponse(id) {
            return this.llmCache[id] || null;
          },
        setCachedResponse(id, response) {
        this.llmCache[id] = response;
        console.log("description cached for id")
        },
        setBusinessType(type) {
            if (!this.user) this.user = {}
            this.user.businessType = type
        },
        async login(credentials) {
            try {
                const response = await this.$users({
                method: 'post',
                url: '/login',
                data: credentials,
                });
                
                const { token, user } = response.data;
                
                // Store token and user
                localStorage.setItem('token', token);
                this.user = user;
                this.token = token;
                
                // Set authorization headers for all APIs
                this.$users.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                this.$businessVerification.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                return user;  // Return for confirmation
            } catch (error) {
                console.error('Login error:', error);
                throw error;  // Re-throw for component to handle
            }
        },
        async loginDuped(credentials) {
            try {
                router.push('/dashboard');
            } catch (error) {
                // Re-throw the error to be caught in `loginUser`
                throw error;
                console.error(error)
            }
        },
        async getSession() {
            if (!this.token) return;
                // Set the token to axios defaults
            this.$users.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            this.$businessVerification.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            try {
                // Request an endpoint that verifies the token and returns user info
                const response = await this.$users.get('/session');
                this.user = response.data.user;
            } catch (error) {
                // If the token is invalid or expired, clear stored info
                this.token = null;
                this.user = {};
                localStorage.removeItem('token');
            }
        },
        async logout(apiInstance) {
            this.user = {};
            this.token = null;

            // 3) Remove token from local storage 
            localStorage.removeItem('token');

            // 4) Remove Authorization header from Axios (optional)
            delete this.$users.defaults.headers.common['Authorization'];
            delete this.$businessVerification.defaults.headers.common['Authorization'];

            // 5) Redirect to login
            router.push('/login');
        },
    },
});
