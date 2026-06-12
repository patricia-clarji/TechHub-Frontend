<script setup>
const whyItems = [
    { emoji: '🚚', title: 'Fast Delivery', desc: 'Same-day dispatch on most orders.' },
    { emoji: '🔒', title: 'Secure Payments', desc: 'Encrypted checkout with major payment methods.' },
    { emoji: '🛡', title: 'Product Warranty', desc: 'Manufacturer-backed warranty included.' },
    { emoji: '💬', title: '24/7 Support', desc: 'Expert assistance whenever you need it.' }
];
</script>

<template>
    <section id="why-techhub" class="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div class="reveal">
            <span class="section-badge">Why TechHub</span>
            <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6 mb-4">Everything You Need,<br> Nothing to Worry About</h2>
            <p class="text-[var(--text-muted)] max-w-lg">TechHub delivers a seamless, premium shopping experience from start to finish.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            <div v-for="(w, i) in whyItems" :key="i" class="reveal why-card transition-all" :class="`stagger-${i+1}`">
                <span class="why-emoji text-4xl">{{ w.emoji }}</span>
                <h3 class="font-bold text-xl mb-2">{{ w.title }}</h3>
                <p class="text-[var(--text-muted)] text-sm leading-relaxed">{{ w.desc }}</p>
            </div>
        </div>
    </section>
</template>