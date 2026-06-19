<script setup>
import { onMounted } from 'vue';

const orderId = 'TH-' + Math.random().toString(36).substr(2, 9).toUpperCase();

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
</script>

<template>
    <main class="pt-48 pb-32 max-w-3xl mx-auto px-6 text-center">
        <div class="reveal">
            <div class="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)] animate-[badgePop_0.8s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <i class="fa-solid fa-check text-4xl"></i>
            </div>
            
            <span class="section-badge">Success Protocol</span>
            <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6 mb-4 reveal reveal-delay-1">Execution Confirmed</h1>
            <p class="text-[var(--text-muted)] text-lg mb-12 reveal reveal-delay-2">Your hardware provisions have been assigned to the logistics pipeline for architectural verification.</p>
        </div>

        <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-10 reveal reveal-delay-3 shadow-2xl">
            <div class="grid grid-cols-2 gap-8 text-left border-b border-[var(--border)] pb-8 mb-8 reveal reveal-delay-4">
                <div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Order ID</p>
                    <p class="font-mono text-sm font-bold text-[var(--accent)]">{{ orderId }}</p>
                </div>
                <div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Estimated Arrival</p>
                    <p class="text-sm font-bold">2-4 Logic Days</p>
                </div>
            </div>
            
            <p class="text-sm text-[var(--text-muted)] leading-relaxed mb-10 reveal reveal-delay-5">
                A detailed confirmation matrix has been dispatched to your digital contact address. 
                You can track the transit status in your user terminal.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center reveal reveal-delay-6">
                <router-link to="/products" class="bg-[var(--accent)] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn">Return to Catalog</router-link>
                <router-link to="/account" class="border border-[var(--border)] text-[var(--text)] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-all">Track Deployment</router-link>
            </div>
        </div>
    </main>
</template>