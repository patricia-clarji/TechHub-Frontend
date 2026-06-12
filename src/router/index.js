import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home/index.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/products', name: 'Products', component: () => import('@/pages/Products/index.vue') },
    { path: '/products/:id', name: 'ProductDetail', component: () => import('@/pages/Products/ProductDetail.vue') },
    { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart/index.vue') },
    { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist/index.vue') },
    { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout/index.vue') },
    { path: '/account', name: 'Account', component: () => import('@/pages/Account/index.vue') },
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

export default router;