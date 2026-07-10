import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home/index.vue';
import config from '@/config';
import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';

const adminResourceRoutes = [
    'stores', 'customers', 'customer-addresses', 'categories', 'collections', 'brands', 'variant-types',
    'products', 'product-variants', 'product-notification-requests', 'wishlist', 'cart', 'payment-methods',
    'available-payment-methods', 'shipping-countries', 'promotions', 'free-deliveries', 'checkout', 'orders',
    'contact', 'policies', 'banners', 'announcement-bars', 'submit-product-requests',
];

const routes = [
    { path: '/', name: 'Home', component: Home, meta: { title: 'Premium Electronics', description: 'Shop premium electronics, computers, gaming gear and smart devices at TechHub.' } },
    { path: '/products', name: 'Products', component: () => import('@/pages/Products/index.vue'), meta: { title: 'Products', description: 'Browse the TechHub electronics catalog by category, brand, price and availability.' } },
    { path: '/categories', name: 'Categories', redirect: { name: 'Products' } },
    { path: '/products/:identifier', name: 'ProductDetail', component: () => import('@/pages/Products/ProductDetail.vue'), meta: { title: 'Product Details', description: 'View product pricing, images, variants, specifications, and current availability.' } },
    { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart/index.vue'), meta: { title: 'Cart', description: 'Review products, variants, quantities, and totals in your TechHub cart.' } },
    { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist/index.vue'), meta: { title: 'Wishlist', description: 'Review products saved to your TechHub wishlist.' } },
    { path: '/account', name: 'Account', component: () => import('@/pages/Account/index.vue'), meta: { requiresAuth: true, title: 'My Account', description: 'View your secure TechHub customer account.' } },
    { path: '/settings', name: 'Settings', component: () => import('@/pages/Settings/index.vue'), meta: { requiresAuth: true, title: 'Settings', description: 'Manage your secure TechHub customer profile and preferences.' } },
    { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout/index.vue'), meta: { title: 'Submit Order Request', description: 'Submit a secure cash-on-delivery order request without entering payment-card details.' } },
    { path: '/faq', name: 'FAQ', component: () => import('@/pages/FAQ/index.vue'), meta: { title: 'Frequently Asked Questions', description: 'Answers about TechHub product availability, order requests, payment, and warranty.' } },
    { path: '/about', name: 'About', component: () => import('@/pages/About/index.vue'), meta: { title: 'About', description: 'Learn about TechHub and our premium electronics storefront.' } },
    { path: '/contact', name: 'Contact', component: () => import('@/pages/Contact/index.vue'), meta: { title: 'Contact', description: 'Contact TechHub about products, order requests, warranty, or support.' } },
    { path: '/order-confirmation', name: 'OrderConfirmation', component: () => import('@/pages/OrderConfirmation/index.vue'), meta: { title: 'Request Received', description: 'Your TechHub order request was received.' } },
    { path: '/deals', name: 'Deals', component: () => import('@/pages/Deals/index.vue'), meta: { title: 'Deals', description: 'Browse current TechHub offers provided by live Osimart pricing.' } },
    { path: '/admin/login', name: 'AdminLogin', component: () => import('@/admin/pages/AdminLogin.vue'), meta: { title: 'Admin Login', description: 'Sign in to the TechHub admin workspace.' } },
    {
        path: '/admin',
        component: () => import('@/admin/AdminLayout.vue'),
        meta: { admin: true, title: 'Admin Workspace', description: 'Read-only TechHub store operations workspace.' },
        redirect: '/admin/overview',
        children: [
            { path: 'overview', name: 'AdminOverview', component: () => import('@/admin/pages/AdminOverview.vue'), meta: { admin: true, adminTitle: 'Overview' } },
            { path: 'analytics', name: 'AdminAnalytics', component: () => import('@/admin/pages/AdminOverview.vue'), meta: { admin: true, adminTitle: 'Analytics' } },
            { path: 'products/new', name: 'AdminProductNew', component: () => import('@/admin/pages/AdminProductForm.vue'), meta: { admin: true, adminTitle: 'New product' } },
            { path: 'products/:id/edit', name: 'AdminProductEdit', component: () => import('@/admin/pages/AdminProductForm.vue'), meta: { admin: true, adminTitle: 'Edit product' } },
            ...adminResourceRoutes.map((resource) => ({
                path: resource,
                name: `Admin${resource.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}`,
                component: () => import('@/admin/pages/AdminResourcePage.vue'),
                props: { resource },
                meta: { admin: true, adminTitle: resource[0].toUpperCase() + resource.slice(1) },
            })),
            ...adminResourceRoutes.map((resource) => ({
                path: `${resource}/:id`,
                name: `Admin${resource.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Detail`,
                component: () => import('@/admin/pages/AdminResourceDetail.vue'),
                props: (route) => ({ resource, id: route.params.id }),
                meta: { admin: true, adminTitle: `${resource[0].toUpperCase() + resource.slice(1)} detail` },
            })),
            { path: 'settings', name: 'AdminSettings', component: () => import('@/admin/pages/AdminSettings.vue'), meta: { admin: true, adminTitle: 'Settings' } },
        ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0, behavior: 'smooth' };
    }
});

router.beforeEach((to) => {
    const userStore = useUserStore();
    if (to.name === 'AdminLogin' && userStore.isAuthenticated) {
        return { path: typeof to.query.redirect === 'string' ? to.query.redirect : '/admin/overview' };
    }
    if (to.meta.admin && !userStore.isAuthenticated) {
        return { name: 'AdminLogin', query: { redirect: to.fullPath } };
    }
    if (!to.meta.requiresAuth) return true;
    if (userStore.isAuthenticated) return true;
    useUIStore().authModalOpen = true;
    return { name: 'Home', query: { signIn: 'required' } };
});

router.afterEach((to) => {
    const category = typeof to.query.category === 'string' ? to.query.category : '';
    const titleBase = category && to.name === 'Products' ? `${category} Products` : to.meta?.title;
    const title = titleBase ? `${titleBase} | ${config.SITE.NAME}` : `${config.SITE.NAME} | Premium Electronics`;
    const description = category
        ? `Shop ${category} products at ${config.SITE.NAME}. Browse current prices, availability, brands, and product details.`
        : to.meta?.description || `Discover premium electronics and technology at ${config.SITE.NAME}.`;
    document.title = title;
    const setMeta = (selector, attributes) => {
        let element = document.head.querySelector(selector);
        if (!element) {
            element = document.createElement('meta');
            document.head.appendChild(element);
        }
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    };
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: new URL(config.SITE.DEFAULT_OG_IMAGE, config.SITE.URL || window.location.origin).href });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = new URL(to.fullPath, config.SITE.URL || window.location.origin).href;

    const setJsonLd = (id, value) => {
        document.getElementById(id)?.remove();
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(value);
        document.head.appendChild(script);
    };
    const baseUrl = config.SITE.URL || window.location.origin;
    setJsonLd('organization-schema', {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: config.SITE.NAME,
        url: baseUrl,
        logo: new URL(config.SITE.DEFAULT_OG_IMAGE, baseUrl).href,
    });
    setJsonLd('breadcrumb-schema', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', baseUrl).href },
            ...(to.name === 'Home' ? [] : [{ '@type': 'ListItem', position: 2, name: titleBase || String(to.name), item: canonical.href }]),
        ],
    });
});

export default router;
