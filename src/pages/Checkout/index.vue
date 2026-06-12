<script setup>
import { ref } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useToastStore } from '../../stores/toast';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const toastStore = useToastStore();
const router = useRouter();

const fullName = ref('');
const email = ref('');
const address = ref('');
const cardNumber = ref('');

const executeOrder = () => {
    if (!fullName.value || !email.value || !address.value) {
        toastStore.showToast('Please fill out necessary operations metadata.', 'fa-triangle-exclamation');
        return;
    }
    cartStore.clearCart();
    toastStore.showToast('Order processing pipeline initialized successfully!', 'fa-circle-check');
    router.push('/order-confirmation');
};
</script>

<template>
    <main class="pt-32 max-w-5xl mx-auto px-6 space-y-12">
        <h1 class="font-[Playfair_Display] text-4xl font-bold text-center">Execution Checkout Pipeline</h1>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div class="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2rem] space-y-4 shadow-xl">
                <h3 class="font-bold text-lg mb-2">Deployment Dispatch Metrics</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs uppercase text-[var(--text-muted)] mb-1 font-medium">Recipient Full
                            Name</label>
                        <input v-model="fullName" type="text"
                            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-sm focus:outline-none" />
                    </div>
                    <div>
                        <label class="block text-xs uppercase text-[var(--text-muted)] mb-1 font-medium">Notification
                            Email Channel</label>
                        <input v-model="email" type="email"
                            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-sm focus:outline-none" />
                    </div>
                    <div>
                        <label class="block text-xs uppercase text-[var(--text-muted)] mb-1 font-medium">Physical
                            Delivery Terminal Address</label>
                        <input v-model="address" type="text"
                            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-sm focus:outline-none" />
                    </div>
                </div>
            </div>

            <div class="lg:col-span-4 space-y-6">
                <div class="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2rem] space-y-3 shadow-xl">
                    <h3 class="font-bold text-lg mb-2">Secure Clearing Architecture</h3>
                    <div>
                        <label class="block text-xs uppercase text-[var(--text-muted)] mb-1 font-medium">Corporate Line Card Number</label>
                        <input v-model="cardNumber" type="text" placeholder="•••• •••• •••• ••••"
                            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-sm focus:outline-none" />
                    </div>
                    <div class="space-y-2 pt-4 border-t border-[var(--border)]">
                        <div class="flex justify-between text-xs text-[var(--text-muted)] uppercase tracking-widest">
                            <span>Gross Subtotal</span>
                            <span>$ {{ cartStore.subtotal.toFixed(2) }}</span>
                        </div>
                        <div v-if="cartStore.discountTotal > 0" class="flex justify-between text-xs text-green-600 font-bold uppercase tracking-widest animate-pulse">
                            <span>Promotional Credit Applied</span>
                            <span>-$ {{ cartStore.discountTotal.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-[var(--border)] flex justify-between font-bold text-lg text-[var(--accent)] animate-glow-pulse">
                        <span>Total Settlement</span>
                        <span class="settle-number">$ {{ cartStore.totalAmount.toFixed(2) }}</span>
                    </div>
                </div>

                <button @click="executeOrder" :disabled="cartStore.items.length === 0"
                    class="w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] premium-btn disabled:opacity-50 text-white font-bold py-4 rounded-full text-center block shadow-lg">
                    Finalize Transaction Placement
                </button>
            </div>
        </div>
    </main>
</template>
