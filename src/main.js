import { createPinia } from 'pinia';
import { createApp } from 'vue';
import 'vuetify/styles';
import App from './App.vue';
import './assets/scss/misc.scss';
import axios from './plugins/axios';
import vuetify from './plugins/vuetify';
import router from './router';
import { useCompanyStore } from './store/company';
import { useOverlayStore } from './store/overlay';
import { useUserStore } from './store/user';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// 2) Then plugins that might touch stores
app.use(axios);
app.use(vuetify);

pinia.use(({store}) => {
    store.$users = app.config.globalProperties.$usersApi;
    store.$businessVerification = app.config.globalProperties.$businessVerificationApi;
    store.$companies = app.config.globalProperties.$companiesApi;
});

(async () => {
    // Initialize the user store and fetch session info
    const userStore = useUserStore();
    const companyStore = useCompanyStore();

    const overlayStore = useOverlayStore();
    await userStore.getSession();

    // Apply router and mount app
    app.use(router).mount('#app');
})();

//comment for change