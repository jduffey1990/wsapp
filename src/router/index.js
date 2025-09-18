import {createRouter, createWebHistory, createWebHashHistory} from 'vue-router';
import Login from '@/views/login-create/LoginPage.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import Product from '@/views/dashboard/brand/Product.vue';
import Home from '@/views/landing/Home.vue';
import {useUserStore} from '@/store/user';
import Settings from '@/views/Settings.vue';
import Success from "@/components/Success.vue";
import Payment from "@/components/Payment";
import BrandMatch from "@/views/landing/BrandMatchStep";
import RetailerMatch from "@/views/landing/RetailerMatchStep.vue";
import TechShowcase from '@/components/TechShowcase.vue';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL), // Use hash history for ghPages compatibility
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
            path: '/brand',
            name: 'BrandMatch',
            component: BrandMatch
        },
        {
            path: '/retailer',
            name: 'RetailerMatch',
            component: RetailerMatch
        },
        {
            path: '/techShowcase',
            name: 'techShowcase',
            component: TechShowcase
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
