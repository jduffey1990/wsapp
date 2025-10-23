import 'vuetify/styles';
import App from './App.vue';
import {createApp} from 'vue';
import './assets/scss/misc.scss';
import axios from './plugins/axios';
import {createPinia} from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import {useUserStore} from './store/user';
import {useCompanyStore} from './store/company';
import {useOverlayStore} from './store/overlay';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// 2) Then plugins that might touch stores
app.use(axios);
app.use(vuetify);

pinia.use(({store}) => {
    store.$users = app.config.globalProperties.$usersApi;
    store.$businessVerification = app.config.globalProperties.$businessVerificationApi;
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
