import PasswordUpdate from "@/components/PasswordUpdate.vue";
import Payment from "@/components/Payment";
import Success from "@/components/Success.vue";
import TechShowcase from '@/components/TechShowcase.vue';
import { useUserStore } from '@/store/user';
import Settings from '@/views/Settings.vue';
import Dashboard from "@/views/dashboard/Dashboard.vue";
import BrandPanel from "@/views/dashboard/brand/BrandPanel.vue";
import Product from '@/views/dashboard/brand/Product.vue';
import ConversationsPanel from "@/views/dashboard/conversations/ConversationsPanel.vue";
import RecommendationsPanel from "@/views/dashboard/recommendations/RecommendationsPanel.vue";
import RetailersPanel from "@/views/dashboard/retailers/RetailersPanel.vue";
import TeamPanel from "@/views/dashboard/team/TeamPanel.vue";
import Activate from '@/views/landing/Activate.vue';
import BrandMatch from "@/views/landing/BrandMatchStep";
import Home from '@/views/landing/Home.vue';
import RetailerMatch from "@/views/landing/RetailerMatchStep.vue";
import Login from '@/views/login-create/LoginPage.vue';
import Workshop from '@/views/dashboard/workshop/WorkshopPanel.vue'
import WorkshopRetailerDetail from "@/views/dashboard/workshop/WorkshopRetailerDetail.vue";
import { createRouter, createWebHistory } from 'vue-router';


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // Use hash history for ghPages compatibility
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
            path: '/match/:aud',                 // aud = 'brand' | 'retailer'
            name: 'Match',
            component: BrandMatch,
            props: route => {
            const aud = String(route.params.aud || '').toLowerCase()
            return aud === 'brand'
                ? { youSingular: 'Brand', themPlural: 'Retailers', themSingular: 'Retailer', youPlural: 'Brands' }
                : { youSingular: 'Retailer', themPlural: 'Brands', themSingular: 'Brand', youPlural: 'Retailers' }
            }
        },
        {
            path: '/activate/:token?',                
            name: 'Activate',
            component: Activate,
            props: true  
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
            component: Dashboard,
            children: [
                {
                    path: '',
                    redirect: '/dashboard/brand'
                },
                {
                    path: 'brand',
                    name: 'DashboardBrand',
                    component: BrandPanel
                },
                {
                    path: 'team',
                    name: 'DashboardTeam',
                    component: TeamPanel
                },
                {
                    path: 'retailers',
                    name: 'DashboardRetailers',
                    component: RetailersPanel
                },
                {
                    path: 'conversations',
                    name: 'DashboardConversations',
                    component: ConversationsPanel
                },
                {
                    path: 'conversations/:id',
                    name: 'ConversationDetail',
                    component: ConversationsPanel, // Will show specific conversation
                    props: true
                },
                {
                    path: 'recommendations',
                    name: 'DashboardRecommendations',
                    component: RecommendationsPanel
                },
                {
                path: 'workshop',
                name: 'Workshop',
                component: Workshop
                },
                {
                path: 'workshop/:retailerId',
                name: 'WorkshopRetailerDetail',
                component: WorkshopRetailerDetail
                },
            ]
        },
        //         {
        // path: '/dashboard',
        // name: 'Dashboard',
        // component: Dashboard,
        // children: [
        //     // ...
        // ]
        // },
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
            path: "/update-password",
            name: "PasswordUpdate",
            component: PasswordUpdate
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
