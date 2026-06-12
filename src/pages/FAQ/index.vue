<script setup>
import { ref } from 'vue';

const faqs = ref([
    { q: "How are hardware items verified for shipment quality?", a: "Every module undergoes individual structural load testing and aesthetic parity verification sequences within controlled environments prior to freight dispatch assignment operations.", open: true },
    { q: "What parameters determine free complimentary freight delivery?", a: "Order groupings with total calculation aggregates scaling above the $500 threshold automatically bypass baseline logistics courier fee matrices.", open: false },
    { q: "Can device coverage configurations be transferred internationally?", a: "Yes, our enterprise luxury warranty tokens are registered directly on immutable decentralized platform servers to enable universal validation.", open: false }
]);
</script>

<template>
    <main class="pt-32 max-w-3xl mx-auto px-6 space-y-12">
        <div class="text-center space-y-3">
            <span class="section-badge">Knowledge Matrices</span>
            <h1 class="font-[Playfair_Display] text-4xl font-extrabold">Operational Inquiries Matrix</h1>
            <p class="text-sm text-[var(--text-muted)]">Pre-calculated architectural information nodes regarding TechHub
                procedures.</p>
        </div>

        <div class="space-y-4">
            <div v-for="(f, i) in faqs" :key="i"
                class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <button @click="f.open = !f.open"
                    class="w-full p-5 flex justify-between items-center text-left hover:bg-[var(--bg-muted)]/40 transition-colors">
                    <span class="font-bold text-sm text-[var(--text)]">{{ f.q }}</span>
                    <i :class="f.open ? 'fa-minus' : 'fa-plus'" class="fa-solid text-xs text-[var(--accent)]"></i>
                </button>
                <div v-if="f.open"
                    class="p-5 border-t border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg)]/30">
                    {{ f.a }}
                </div>
            </div>
        </div>
    </main>
</template>