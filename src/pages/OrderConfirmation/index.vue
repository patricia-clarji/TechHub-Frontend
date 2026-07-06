<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const reference = computed(() => String(route.query.request || ''));
if (!reference.value) router.replace('/products');
</script>

<template>
  <main class="pt-48 pb-32 max-w-3xl mx-auto px-6 text-center">
    <div class="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 mb-8 border border-green-500/20">
      <i class="fa-solid fa-check text-4xl" aria-hidden="true"></i>
    </div>
    <span class="section-badge">Request received</span>
    <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6 mb-4">Thank you</h1>
    <p class="text-[var(--text-muted)] text-lg mb-10">Your order request was submitted successfully. No payment has been taken.</p>
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-xl">
      <p class="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2">Request reference</p>
      <p class="font-mono font-bold text-[var(--accent)] break-all">{{ reference }}</p>
      <p class="text-sm text-[var(--text-muted)] leading-relaxed my-8">TechHub will contact you to confirm availability, delivery details, and cash-on-delivery terms.</p>
      <router-link to="/products" class="inline-block bg-[var(--accent)] text-white px-10 py-4 rounded-full font-bold">Continue Shopping</router-link>
    </div>
  </main>
</template>
