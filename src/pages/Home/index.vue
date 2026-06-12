<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import ProductCard from '../../components/cards/ProductCard.vue';
import { useCartStore } from '@/stores/cart';
import NewsletterSection from '@/components/layout/NewsletterSection.vue';

const router = useRouter();
const productsStore = useProductsStore();
const cartStore = useCartStore();

const featured = computed(() => productsStore.sampleProducts.slice(0, 4));

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const saleEnd = new Date(Date.now() + (3 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000));

const trustItems = [
    { icon: 'fa-truck-fast', title: 'Free Delivery', desc: 'Fast shipping nationwide' },
    { icon: 'fa-shield-halved', title: 'Secure Checkout', desc: 'Protected transactions' },
    { icon: 'fa-award', title: 'Genuine Products', desc: 'Authorized brand partners' },
    { icon: 'fa-headset', title: 'Premium Support', desc: 'Assistance whenever needed' }
];

const whyItems = [
    { emoji: '🚚', title: 'Fast Delivery', desc: 'Same-day dispatch on most orders.' },
    { emoji: '🔒', title: 'Secure Payments', desc: 'Encrypted checkout with major payment methods.' },
    { emoji: '🛡', title: 'Product Warranty', desc: 'Manufacturer-backed warranty included.' },
    { emoji: '💬', title: '24/7 Support', desc: 'Expert assistance whenever you need it.' }
];

const categories = [
    { name: 'Smartphones', sub: 'Premium Mobile', img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200', desc: 'Flagship devices from Apple, Samsung and other leading brands.' },
    { name: 'Laptops', sub: 'Productivity', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200', desc: 'Powerful machines for creators, professionals and students.' },
    { name: 'Gaming', sub: 'Entertainment', img: 'https://images.unsplash.com/photo-1603481546238-487240415921?w=1200', desc: 'Consoles, accessories and next-generation gaming gear.' },
    { name: 'Smart Home', sub: 'Smart Living', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200', desc: 'Connected devices that simplify everyday life.' }
];

const testimonials = [
    { name: 'Sarah Johnson', role: 'Verified Buyer', img: 'https://randomuser.me/api/portraits/women/44.jpg', text: "Fast shipping and excellent quality. My order arrived two days early and the packaging was perfect." },
    { name: 'Michael Carter', role: 'Verified Buyer', img: 'https://randomuser.me/api/portraits/men/32.jpg', text: "The best electronics store I've ever used. Genuine products, real prices, and outstanding customer care." },
    { name: 'Emma Rodriguez', role: 'Verified Buyer', img: 'https://randomuser.me/api/portraits/women/68.jpg', text: "Amazing customer service and delivery. Needed help choosing a laptop and got expert advice instantly." }
];

const stats = [
    { display: '10', target: 10, label: 'Products', suffix: 'K+' },
    { display: '50', target: 50, label: 'Customers', suffix: 'K+' },
    { display: '500', target: 500, label: 'Brands', suffix: '+' },
    { display: '99', target: 99, label: 'Satisfaction', suffix: '%' }
];

const finderOptions = [
    { label: 'Work', emoji: '💼' },
    { label: 'Study', emoji: '📚' },
    { label: 'Gaming', emoji: '🎮' },
    { label: 'Creative', emoji: '🎨' }
];

const activeFinder = ref(null);
const selectFinder = (label) => activeFinder.value = label;

const generateRecommendation = () => {
    if (!activeFinder.value) return;
    
    const mapping = {
        'Work': 'Laptops',
        'Study': 'Laptops',
        'Gaming': 'Gaming',
        'Creative': 'Audio'
    };

    router.push({ name: 'Products', query: { category: mapping[activeFinder.value] } });
};

let observer = null;
let timerInterval = null;
const scrollY = ref(0);
const animatedStats = ref(stats.map(s => ({ ...s, current: 0 })));

const animateStats = () => {
    animatedStats.value.forEach((s, index) => {
        let start = 0;
        const end = s.target;
        const duration = 2000; // 2 seconds
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            s.current = Math.floor(start);
            if (start >= end) { s.current = end; clearInterval(timer); }
        }, 16);
    });
};

const updateTimer = () => {
    const now = new Date();
    const diff = saleEnd - now;
    
    timeLeft.value = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
    };
};

const handleScroll = () => {
    scrollY.value = window.scrollY;
};

onMounted(() => {
    timerInterval = setInterval(updateTimer, 1000);
    window.addEventListener('scroll', handleScroll);
    updateTimer();
    
    // Initialize scroll reveal
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); 
                if (entry.target.classList.contains('stats-grid')) {
                    animateStats();
                }
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

onUnmounted(() => {
    if (observer) observer.disconnect();
    if (timerInterval) clearInterval(timerInterval);
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <main class="overflow-hidden">
        <!-- Hero Section -->
        <section id="home" class="relative min-h-screen flex items-center max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-20 overflow-hidden">
            <div class="mesh-bg">
                <div class="mesh-blob"></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
                <div class="space-y-8 relative z-10 overflow-hidden">
                    <span class="section-badge hero-badge inline-flex">
                        <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block animate-ping mr-3"></span>
                        Premium Electronics
                    </span>
                    <h1 class="font-[Playfair_Display] text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.06] hero-title">
                        Discover the<br>
                        <em class="not-italic relative">
                            <span class="relative z-10 text-[var(--accent)]">Latest Tech</span>
                            <span class="absolute bottom-2 left-0 right-0 h-3 bg-[var(--accent)] opacity-10 -z-0 rounded"></span>
                        </em><br />
                        at Unbeatable<br />Prices
                    </h1>
                    <p class="text-[var(--text-muted)] text-lg leading-relaxed max-w-md hero-body">
                        Shop premium electronics, gaming gear, laptops, smartphones, and accessories — all in one place.
                    </p>
                    <div class="flex flex-wrap gap-4 hero-btns">
                        <router-link to="/products" class="group inline-flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                            <span>Shop Now</span>
                            <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                        </router-link>
                        <router-link to="/categories" class="flex items-center gap-3 border border-[var(--accent)] text-[var(--accent)] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
                            <span>View Categories</span>
                        </router-link>
                    </div>
                </div>
                <div class="hidden lg:block relative hero-img">
                    <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400" 
                        class="h-[580px] w-full object-cover rounded-[2.5rem] shadow-2xl relative z-10 hero-parallax" 
                        :style="{ transform: `translateY(${scrollY * 0.08}px)` }" alt="Tech Hub">
                </div>
            </div>
        </section>

        <!-- Trust Bar Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-16">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(t, i) in trustItems" :key="i" class="reveal bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center transition-all hover:-translate-y-2 hover:shadow-xl" :class="`stagger-${i+1}`">
                    <i :class="['fa-solid', t.icon]" class="text-2xl text-[var(--accent)] mb-4 block"></i>
                    <h3 class="font-bold text-sm text-[var(--text)]">{{ t.title }}</h3>
                    <p class="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{{ t.desc }}</p>
                </div>
            </div>
        </section>

        <!-- Why TechHub Section -->
        <section id="why-techhub" class="max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <div class="reveal">
                <span class="section-badge">Why TechHub</span>
                <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6 mb-4">Everything You Need,<br> Nothing to Worry About</h2>
                <p class="text-[var(--text-muted)] max-w-lg">TechHub delivers a seamless, premium shopping experience from start to finish.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                <div v-for="(w, i) in whyItems" :key="i" class="reveal bg-[var(--bg-muted)] border border-transparent hover:border-[var(--border)] rounded-3xl p-10 group transition-all" :class="`stagger-${i+1}`">
                    <span class="text-4xl mb-6 block transition-transform group-hover:scale-110 group-hover:rotate-6">{{ w.emoji }}</span>
                    <h3 class="font-bold text-xl mb-2">{{ w.title }}</h3>
                    <p class="text-[var(--text-muted)] text-sm leading-relaxed">{{ w.desc }}</p>
                </div>
            </div>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="max-w-7xl mx-auto px-6 lg:px-10 py-24">
            <div class="text-center mb-16 reveal">
                <span class="section-badge">Browse By Category</span>
                <h2 class="font-[Playfair_Display] text-5xl lg:text-6xl font-bold mt-8 mb-4">Shop by Category</h2>
                <p class="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">Explore premium technology collections carefully curated for productivity, entertainment, and modern living.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <router-link v-for="cat in categories" :key="cat.name" 
                    :to="{ name: 'Products', query: { category: cat.name } }" class="cat-card h-[420px] lg:h-[500px] reveal group relative overflow-hidden rounded-[2.5rem]">
                    <img :src="cat.img" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" :alt="cat.name">
                    <div class="cat-overlay"></div>
                    <div class="cat-content absolute bottom-0 left-0 right-0 p-10 text-white transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                        <p class="uppercase tracking-[0.2em] text-[10px] mb-2 opacity-80">{{ cat.sub }}</p>
                        <h3 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold">{{ cat.name }}</h3>
                        <div class="cat-line w-0 h-0.5 bg-[var(--accent)] mt-4 transition-all duration-500 group-hover:w-16"></div>
                        <p class="mt-4 text-white/70 max-w-xs text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">{{ cat.desc }}</p>
                        <div class="cat-arrow"><i class="fa-solid fa-arrow-right text-xs"></i></div>
                    </div>
                </router-link>
            </div>
        </section>

        <!-- Brands Section -->
        <section class="py-24 overflow-hidden">
            <div class="text-center mb-14 reveal">
                <span class="section-badge">Trusted Brands</span>
                <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Powered By Industry Leaders</h2>
            </div>
            <div class="brand-fade relative">
                <div class="brand-track flex gap-8">
                    <div v-for="(b, i) in [...['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'ASUS'], ...['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'ASUS']]" 
                        :key="i" class="min-w-[180px] h-[90px] glass-panel rounded-2xl flex items-center justify-center font-bold text-xl opacity-40 hover:opacity-100 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
                        {{ b }}
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Products -->
        <section id="products" class="max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 reveal">
                <div>
                    <span class="section-badge">Featured Products</span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Hot Picks This Week</h2>
                </div>
                <router-link to="/products" class="text-[var(--accent)] text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    View All <i class="fa-solid fa-arrow-right text-xs"></i>
                </router-link>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <ProductCard v-for="(p, i) in featured" :key="p.id" :product="p" class="reveal" :class="`reveal-delay-${i+1}`" />
            </div>
        </section>

        <!-- Flash Sale Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div class="newsletter-section reveal text-center relative z-10">
                <div class="relative z-10">
                    <span class="section-badge">Limited Time Offer</span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Flash Sale Event</h2>
                    <p class="mt-4 text-[var(--text-muted)] max-w-md mx-auto">Exclusive discounts on selected premium devices. Don't miss out.</p>
                    
                    <div class="flex justify-center gap-4 sm:gap-6 mt-12">
                        <div v-for="(val, unit) in timeLeft" :key="unit" class="timer-block w-24 sm:w-28 p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl">
                            <h3 class="text-4xl sm:text-5xl font-[Playfair_Display] font-bold text-[var(--accent)]">{{ String(val).padStart(2, '0') }}</h3>
                            <p class="mt-2 text-[10px] uppercase tracking-widest font-bold opacity-60">{{ unit }}</p>
                        </div>
                    </div>

                    <div class="mt-12">
                        <router-link to="/deals" class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-xl">
                            Shop the Sale
                        </router-link>
                    </div>
                </div>
            </div>
        </section>

        <!-- Product Finder Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-8 lg:p-20 reveal overflow-hidden relative">
                <div class="text-center relative z-10">
                    <span class="section-badge">Curated Recommendations</span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Find Your Perfect Device</h2>
                    <p class="mt-6 text-[var(--text-muted)] max-w-2xl mx-auto">Select your primary use case and discover products tailored to your professional or creative execution needs.</p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 relative z-10">
                    <button v-for="opt in finderOptions" :key="opt.label" 
                        @click="selectFinder(opt.label)"
                        :class="activeFinder === opt.label ? 'border-[var(--accent)] bg-[var(--bg-muted)] shadow-xl -translate-y-2' : 'border-transparent bg-[var(--bg-muted)]/50'"
                        class="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-500 hover:-translate-y-2">
                        <span class="text-4xl">{{ opt.emoji }}</span>
                        <span class="font-bold uppercase tracking-widest text-xs">{{ opt.label }}</span>
                    </button>
                </div>

                <div class="text-center mt-16 relative z-10">
                    <button @click="generateRecommendation" class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-12 py-5 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-2xl">
                        Generate Recommendations
                    </button>
                </div>
            </div>
        </section>

        <!-- Testimonials -->
        <section id="testimonials" class="max-w-7xl mx-auto px-6 lg:px-10 py-24">
            <div class="reveal mb-16">
                <span class="section-badge">Happy Customers</span>
                <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">What Our Customers Say</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div v-for="(t, i) in testimonials" :key="i" class="reveal p-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] relative group hover:shadow-2xl transition-all duration-500" :class="`reveal-delay-${i+1}`">
                    <div class="flex items-center gap-4 mb-8">
                        <img :src="t.img" class="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--bg-card)]" alt="Avatar">
                        <div>
                            <h4 class="font-bold text-sm">{{ t.name }}</h4>
                            <p class="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">{{ t.role }}</p>
                        </div>
                    </div>
                    <p class="text-[var(--accent)] mb-4 text-xs">★★★★★</p>
                    <p class="text-[var(--text-muted)] text-sm leading-relaxed italic">"{{ t.text }}"</p>
                </div>
            </div>
        </section>

        <!-- Stats Bar -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[var(--border)]">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-12 stats-grid reveal">
                <div v-for="(s, i) in animatedStats" :key="i" class="text-center group reveal" :class="`reveal-delay-${i+1}`">
                    <h2 class="font-[Playfair_Display] text-5xl lg:text-6xl text-[var(--accent)] font-bold mb-2 transition-transform group-hover:scale-110">
                        {{ s.current }}{{ s.suffix }}
                    </h2>
                    <p class="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.3em]">{{ s.label }}</p>
                </div>
            </div>
        </section>

        <!-- Newsletter -->
        <NewsletterSection />
    </main>
</template>

<style scoped>
@keyframes float {
    0% {
        transform: translateY(0px) rotate(0deg);
    }

    100% {
        transform: translateY(-20px) rotate(1deg);
    }
}
</style>