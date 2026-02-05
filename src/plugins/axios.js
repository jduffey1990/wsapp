import axios from 'axios';
import { useCookies } from 'vue3-cookies';

// Global flag to prevent multiple simultaneous logouts
let isLoggingOut = false;

// Helper function to handle 401 errors and trigger logout
const handleUnauthorizedError = async (error) => {
  // Check if it's a 401 error
  if (error.response?.status === 401) {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    isLoggingOut = true;

    try {
      // Lazy-load the user store to avoid initialization issues
      const { useUserStore } = await import('@/store/user');
      const userStore = useUserStore();

      // Call logout function
      await userStore.logout();
    } catch (logoutError) {
      console.error('Error during automatic logout:', logoutError);
    } finally {
      isLoggingOut = false;
    }
  }

  return Promise.reject(error);
};

export default {
  install: (app) => {
    const { cookies } = useCookies();

    // --- FIRST SERVICE (e.g., Auth Service) ---
    const usersApi = axios.create({
      baseURL: import.meta.env.VITE_USERS_BASE_URL, // e.g. http://localhost:3001 or prod env setting
      withCredentials: true,
    });

    usersApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // Response interceptor for usersApi
    usersApi.interceptors.response.use(
      (response) => response,
      handleUnauthorizedError
    );

    // --- SECOND SERVICE (e.g., verification service for company) ---
    const businessVerificationApi = axios.create({
      baseURL: import.meta.env.VITE_BRANDORA_VERIFY_API_URL, // e.g. http://localhost:3002 or prod env setting
      withCredentials: true,
    });

    businessVerificationApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // Response interceptor for businessVerificationApi
    businessVerificationApi.interceptors.response.use(
      (response) => response,
      handleUnauthorizedError
    );

    // --- Third SERVICE (e.g., Companies Service) ---
    const companiesApi = axios.create({
      baseURL: import.meta.env.VITE_COMPANIES_BASE_URL, // e.g. http://localhost:3003 or prod env setting
      withCredentials: true,
    });

    companiesApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // Response interceptor for companiesApi
    companiesApi.interceptors.response.use(
      (response) => response,
      handleUnauthorizedError
    );

    // Make them available in the Vue app
    app.config.globalProperties.$usersApi = usersApi;
    app.config.globalProperties.$businessVerificationApi = businessVerificationApi;
    app.config.globalProperties.$companiesApi = companiesApi;

    app.provide('$usersApi', usersApi);
    app.provide('$businessVerificationApi', businessVerificationApi);
    app.provide('$companiesApi', companiesApi);
  },
};

