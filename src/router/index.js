import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home/index.vue';
import Products from '../pages/Products/index.vue';
import ProductDetails from '../pages/ProductDetails/index.vue';
import Cart from '../pages/Cart/index.vue';
import Wishlist from '../pages/Wishlist/index.vue';
import Checkout from '../pages/Checkout/index.vue';
import Account from '../pages/Account/index.vue';
import Contact from '../pages/Contact/index.vue';
import FAQ from '../pages/FAQ/index.vue';
import About from '../pages/About/index.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/products', name: 'Products', component: Products },
    { path: '/products/:id', name: 'ProductDetails', component: ProductDetails },
    { path: '/categories', name: 'Categories', component: Products }, // Reusing Products for now
    { path: '/deals', name: 'Deals', component: Products }, // Reusing Products for now
    { path: '/cart', name: 'Cart', component: Cart },
    { path: '/wishlist', name: 'Wishlist', component: Wishlist },
    { path: '/checkout', name: 'Checkout', component: Checkout },
    { path: '/account', name: 'Account', component: Account },
    { path: '/contact', name: 'Contact', component: Contact },
    { path: '/faq', name: 'FAQ', component: FAQ },
    { path: '/about', name: 'About', component: About },
    // Add other routes as you create new pages
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});

export default router;