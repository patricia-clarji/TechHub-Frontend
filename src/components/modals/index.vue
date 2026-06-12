<script setup>
import { onMounted } from 'vue';
import ProductCard from '@/components/cards/ProductCard.vue';
import { useProductsStore } from '@/stores/products';

const productsStore = useProductsStore();
const saleProducts = productsStore.sampleProducts.slice(0, 6); // Mocking sale items

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
</script>

<template>
    <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div class="mb-16 text-center reveal">
            <span class="section-badge">Active Promotions</span>
            <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6">Active Deployment Sales</h1>
            <div class="mt-8 inline-flex items-center gap-4 bg-[var(--bg-muted)] border border-[var(--border)] px-8 py-3 rounded-full">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-widest">Time Remaining: 03 Days : 14 Hours : 22 Minutes</span>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="product in saleProducts" :key="product.id" class="reveal relative">
                <div class="absolute -top-3 -right-3 z-20 bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl">
                    -20% VALUE
                </div>
                <ProductCard :product="product" />
            </div>
        </div>
        
        <div class="mt-20 p-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] text-center reveal">
            <p class="text-[var(--text-muted)] text-sm max-w-xl mx-auto leading-relaxed">Promotional pricing is applied at the point of architectural settlement. All hardware warranties remain fully active during sale events.</p>
        </div>
    </main>
</template>