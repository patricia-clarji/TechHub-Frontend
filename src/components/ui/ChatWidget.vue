<script setup>
import { ref, nextTick, watch } from 'vue';
import { useUIStore } from '@/stores/ui/ui';
import { useProductsStore } from '@/stores/shop/products';

const uiStore = useUIStore();
const productsStore = useProductsStore();
const input = ref('');
const feed = ref(null);
const messages = ref([
  { bot: true, text: 'Welcome to TechHub. I can help you search the live catalog, compare products, or explain shipping and availability.' },
]);
const suggestions = ['Latest products', 'In-stock items', 'Shipping information'];

const scroll = async () => {
  await nextTick();
  feed.value?.scrollTo({ top: feed.value.scrollHeight, behavior: 'smooth' });
};

const answer = (question) => {
  const query = question.toLowerCase();
  if (query.includes('shipping')) return 'Shipping options and final costs are confirmed before payment. Contact our team for destination-specific timing.';
  const inStockOnly = query.includes('stock');
  const products = productsStore.products
    .filter((product) => !inStockOnly || product.inStock)
    .filter((product) => query.includes('latest') || query.includes('stock') || product.name.toLowerCase().includes(query))
    .slice(0, 3);
  if (!products.length) return 'I could not find a matching catalog item. Try a product name, “latest products,” or use the catalog filters.';
  return `You may like: ${products.map((product) => `${product.name} ($${product.price.toFixed(2)})`).join(', ')}.`;
};

const send = async (preset) => {
  const text = String(preset || input.value).trim().slice(0, 300);
  if (!text) return;
  messages.value.push({ bot: false, text });
  input.value = '';
  messages.value.push({ bot: true, text: answer(text) });
  await scroll();
};

watch(() => uiStore.chatWindowOpen, (open) => open && scroll());
</script>

<template>
  <div class="fixed bottom-24 right-6 z-[100]">
    <button type="button" class="w-14 h-14 bg-[var(--accent)] text-white rounded-full shadow-xl"
      :aria-label="uiStore.chatWindowOpen ? 'Close shopping assistant' : 'Open shopping assistant'"
      :aria-expanded="uiStore.chatWindowOpen" @click="uiStore.toggleChat()">
      <i :class="uiStore.chatWindowOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-comments'" aria-hidden="true"></i>
    </button>
    <section v-if="uiStore.chatWindowOpen" aria-label="Shopping assistant"
      class="absolute bottom-20 right-0 w-[90vw] sm:w-96 h-[500px] max-h-[70vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
      <header class="p-5 border-b border-[var(--border)]">
        <h2 class="font-bold">TechHub shopping assistant</h2>
        <p class="text-xs text-[var(--text-muted)]">Catalog help—no personal or payment information required.</p>
      </header>
      <div ref="feed" class="flex-1 overflow-y-auto p-5 space-y-4" aria-live="polite">
        <div v-for="(message, index) in messages" :key="index" class="flex" :class="message.bot ? 'justify-start' : 'justify-end'">
          <p class="max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap"
            :class="message.bot ? 'bg-[var(--bg-muted)]' : 'bg-[var(--accent)] text-white'">{{ message.text }}</p>
        </div>
      </div>
      <div class="p-4 border-t border-[var(--border)]">
        <div class="flex flex-wrap gap-2 mb-3">
          <button v-for="item in suggestions" :key="item" type="button" class="text-xs border rounded-full px-3 py-1" @click="send(item)">{{ item }}</button>
        </div>
        <form class="flex gap-2" @submit.prevent="send()">
          <label for="assistant-message" class="sr-only">Ask about the catalog</label>
          <input id="assistant-message" v-model="input" maxlength="300" autocomplete="off"
            class="flex-1 bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm"
            placeholder="Ask about a product…" />
          <button type="submit" class="w-12 rounded-xl bg-[var(--accent)] text-white" aria-label="Send message">
            <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
