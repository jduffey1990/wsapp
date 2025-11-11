import axios from 'axios';
import { useCookies } from 'vue3-cookies';

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

    // --- SECOND SERVICE (e.g., verification service for company) ---
    const businessVerificationApi = axios.create({
      baseURL: import.meta.env.VITE_BRANDORA_VERIFY_API_URL, // e.g. http://localhost:3002 or prod env setting
      withCredentials: true,
    });

    businessVerificationApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // --- Third SERVICE (e.g., Companies Service) ---
    const companiesApi = axios.create({
      baseURL: import.meta.env.VITE_COMPANIES_BASE_URL, // e.g. http://localhost:3003 or prod env setting
      withCredentials: true,
    });

    companiesApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // Make them available in the Vue app
    app.config.globalProperties.$usersApi = usersApi;
    app.config.globalProperties.$businessVerificationApi = businessVerificationApi;
    app.config.globalProperties.$companiesApi = companiesApi;

    app.provide('$usersApi', usersApi);
    app.provide('$businessVerificationApi', businessVerificationApi);
    app.provide('$companiesApi', companiesApi);
  },
};

