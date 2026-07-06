<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useProductsStore } from '@/stores/shop/products';
import { useToastStore } from '@/stores/ui/toast';
import { useRouter } from 'vue-router';
import { submitOrderRequest } from '@/services/orderRequestService';

const cartStore = useCartStore();
const productsStore = useProductsStore();
const toastStore = useToastStore();
const router = useRouter();
const submitting = ref(false);
const attempted = ref(false);
const form = reactive({ name: '', email: '', phone: '', address: '', notes: '' });

const errors = computed(() => ({
  name: form.name.trim().length >= 2 ? '' : 'Enter your full name.',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Enter a valid email address.',
  phone: /^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim()) ? '' : 'Enter a valid phone number.',
  address: form.address.trim().length >= 10 ? '' : 'Enter a complete delivery address.',
}));
const valid = computed(() => Object.values(errors.value).every((value) => !value));

onMounted(async () => {
  await productsStore.fetchProducts();
  if (!cartStore.items.length) router.replace('/cart');
});

const submit = async () => {
  attempted.value = true;
  if (!cartStore.items.length || cartStore.hasUnavailableItems) {
    toastStore.showToast('Review unavailable or out-of-stock cart items before checkout.', 'fa-triangle-exclamation');
    return;
  }
  if (!valid.value) return;

  submitting.value = true;
  try {
    const response = await submitOrderRequest({
      customer: form,
      address: form.address.trim(),
      notes: form.notes.trim(),
      items: cartStore.detailedItems,
      total: cartStore.totalAmount,
    });
    const reference = response?.id || response?.reference || `REQ-${Date.now().toString(36).toUpperCase()}`;
    cartStore.clearCart();
    router.replace({ name: 'OrderConfirmation', query: { request: reference } });
  } catch {
    toastStore.showToast('We could not submit your request. Please try again or contact TechHub.', 'fa-triangle-exclamation');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <main class="pt-32 pb-24 max-w-6xl mx-auto px-6">
    <div class="mb-10">
      <h1 class="font-[Playfair_Display] text-4xl font-bold">Submit an Order Request</h1>
      <p class="text-[var(--text-muted)] mt-2">Cash on delivery is confirmed by our team. No card details are collected.</p>
    </div>
    <form class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" @submit.prevent="submit" novalidate>
      <section class="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2rem] space-y-5">
        <h2 class="font-bold text-xl">Customer and delivery details</h2>
        <div v-for="field in [
          { key: 'name', label: 'Full name', type: 'text', autocomplete: 'name' },
          { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
          { key: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' },
        ]" :key="field.key">
          <label :for="field.key" class="block text-sm font-semibold mb-2">{{ field.label }}</label>
          <input :id="field.key" v-model="form[field.key]" :type="field.type" :autocomplete="field.autocomplete"
            :aria-invalid="attempted && Boolean(errors[field.key])"
            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl focus:outline-none focus:border-[var(--accent)]" />
          <p v-if="attempted && errors[field.key]" class="text-red-500 text-xs mt-1">{{ errors[field.key] }}</p>
        </div>
        <div>
          <label for="address" class="block text-sm font-semibold mb-2">Delivery address</label>
          <textarea id="address" v-model="form.address" autocomplete="street-address" rows="3"
            :aria-invalid="attempted && Boolean(errors.address)"
            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl focus:outline-none focus:border-[var(--accent)]"></textarea>
          <p v-if="attempted && errors.address" class="text-red-500 text-xs mt-1">{{ errors.address }}</p>
        </div>
        <div>
          <label for="notes" class="block text-sm font-semibold mb-2">Order notes <span class="font-normal text-[var(--text-muted)]">(optional)</span></label>
          <textarea id="notes" v-model="form.notes" maxlength="1000" rows="3"
            class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl focus:outline-none focus:border-[var(--accent)]"></textarea>
        </div>
      </section>

      <aside class="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2rem] space-y-5">
        <h2 class="font-bold text-xl">Order summary</h2>
        <div v-for="item in cartStore.detailedItems" :key="item.lineKey" class="flex gap-3 py-3 border-b border-[var(--border)]">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="w-14 h-14 rounded-lg object-cover" />
          <div class="flex-1">
            <p class="font-semibold text-sm">{{ item.quantity }} × {{ item.name }}</p>
            <p v-if="item.variantName || item.color" class="text-xs text-[var(--text-muted)]">{{ [item.variantName, item.color].filter(Boolean).join(' · ') }}</p>
          </div>
          <p class="font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
        </div>
        <div class="flex justify-between text-lg font-bold pt-2">
          <span>Total</span><span class="text-[var(--accent)]">${{ cartStore.totalAmount.toFixed(2) }}</span>
        </div>
        <p class="text-xs text-[var(--text-muted)]">Submitting sends an order request to TechHub. Our team will confirm stock, delivery, and cash-on-delivery terms before your order is accepted.</p>
        <button type="submit" :disabled="submitting || !cartStore.items.length"
          class="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-full disabled:opacity-50">
          {{ submitting ? 'Submitting…' : 'Submit Order Request' }}
        </button>
      </aside>
    </form>
  </main>
</template>
