import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home/index.vue';
import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';
import AuthService from '@/services/authService';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/products', name: 'Products', component: () => import('@/pages/Products/index.vue') },
    { path: '/categories', name: 'Categories', component: () => import('@/pages/Products/index.vue') },
    { path: '/products/:id', name: 'ProductDetail', component: () => import('@/pages/Products/ProductDetail.vue') },
    { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart/index.vue') },
    { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist/index.vue') },
    { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout/index.vue') },
    { path: '/account', name: 'Account', component: () => import('@/pages/Account/index.vue'), meta: { requiresAuth: true } },
    { path: '/settings', name: 'Settings', component: () => import('@/pages/Settings/index.vue'), meta: { requiresAuth: true } },
    { path: '/faq', name: 'FAQ', component: () => import('@/pages/FAQ/index.vue') },
    { path: '/about', name: 'About', component: () => import('@/pages/About/index.vue') },
    { path: '/contact', name: 'Contact', component: () => import('@/pages/Contact/index.vue') },
    { path: '/order-confirmation', name: 'OrderConfirmation', component: () => import('@/pages/OrderConfirmation/index.vue') },
    { path: '/deals', name: 'Deals', component: () => import('@/pages/Deals/index.vue') }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0, behavior: 'smooth' };
    }
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const uiStore = useUIStore();

    // Protect routes that require authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!userStore.currentUser || !AuthService.isAuthenticated()) {
            uiStore.authModalOpen = true;
            return next({ name: 'Home' });
        }
    }

    // Role-based authorization: route meta may include `roles: ['admin','staff']`
    const requiredRoles = to.meta?.roles;
    if (requiredRoles && requiredRoles.length > 0) {
        const role = userStore.currentUser?.role;
        if (!role || !requiredRoles.includes(role)) {
            // User is not authorized to view this route
            uiStore.showToast?.('You are not authorized to view that page.', 'fa-lock');
            return next({ name: 'Home' });
        }
    }

    return next();
});

export default router;