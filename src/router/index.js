import {createRouter, createWebHistory} from 'vue-router';
import Login from '@/views/login-create/LoginPage.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import Product from '@/views/dashboard/products/Product.vue';
import Home from '@/views/Home.vue';
import {useUserStore} from '@/store/user';
import Settings from '@/views/Settings.vue';
import Success from "@/components/Success.vue";
import Payment from "@/components/Payment";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home,
            beforeEnter: (to, from, next) => {
                const {isLoggedIn} = useUserStore();

                if (!isLoggedIn) {
                    return next();
                }
                next('/dashboard')
            },
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
        },
        {
            path: '/product',
            name: 'Product',
            component: Product,
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
        },
        {
            path: "/payment",
            name: "Payment",
            component: Payment
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings,
        },
        {
            path: "/success",
            name: "Success",
            component: Success
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.name === 'Home' && userStore.isLoggedIn) {
    return next('/dashboard');
  }
  next();
});


export default router;
