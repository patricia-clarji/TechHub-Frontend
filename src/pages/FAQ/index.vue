<script setup>
import { ref } from 'vue';

const faqs = ref([
    { q: "How can I confirm product availability?", a: "Availability is shown from the current Osimart stock data. Our team reconfirms stock before accepting an order request.", open: true },
    { q: "How does payment work?", a: "The website currently accepts order requests for confirmation. No card data or online payment is collected.", open: false },
    { q: "What warranty applies?", a: "Warranty coverage depends on the product and supplier. Contact TechHub before ordering for the written coverage terms.", open: false }
]);
</script>

<template>
    <main class="pt-32 max-w-3xl mx-auto px-6 space-y-12">
        <div class="text-center space-y-3">
            <span class="section-badge">Help center</span>
            <h1 class="font-[Playfair_Display] text-4xl font-extrabold">Frequently Asked Questions</h1>
            <p class="text-sm text-[var(--text-muted)]">Helpful information about products, ordering, and support.</p>
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
