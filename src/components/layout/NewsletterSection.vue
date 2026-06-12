<script setup>
import { ref } from 'vue';

const email = ref('');
const isSubscribed = ref(false);
const isLoading = ref(false);

const handleSubscribe = () => {
    if (!email.value) return;
    
    isLoading.value = true;
    // Simulate API call
    setTimeout(() => {
        isLoading.value = false;
        isSubscribed.value = true;
        email.value = '';
        
        // Reset message after 5 seconds
        setTimeout(() => isSubscribed.value = false, 5000);
    }, 1200);
};
</script>

<template>
    <section class="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div class="newsletter-section bg-[var(--bg-muted)] rounded-[3rem] p-12 lg:p-24 text-center reveal overflow-hidden relative">
            <div class="relative z-10">
                <span class="section-badge">Stay Updated</span>
                <h2 class="font-[Playfair_Display] text-4xl lg:text-6xl font-bold mt-8">Stay Updated With<br> the Latest Tech Deals</h2>
                <p class="mt-6 text-[var(--text-muted)] max-w-lg mx-auto">Subscribe to receive exclusive hardware provision alerts and new model launches.</p>
                
                <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row justify-center gap-3 mt-12 max-w-xl mx-auto">
                    <input 
                        v-model="email"
                        type="email" 
                        placeholder="Enter your email" 
                        required
                        class="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-8 py-4 text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
                    >
                    <button :disabled="isLoading" type="submit" class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-xl disabled:opacity-50">
                        {{ isLoading ? 'Processing...' : (isSubscribed ? 'Subscribed!' : 'Subscribe') }}
                    </button>
                </form>
                <p v-if="isSubscribed" class="mt-4 text-xs font-bold text-green-600 uppercase tracking-widest animate-pulse">Terminal Integrated Successfully</p>
            </div>
        </div>
    </section>
</template>