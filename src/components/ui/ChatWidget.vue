<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '@/stores/ui/ui';
import { useProductsStore } from '@/stores/shop/products';
import { useCartStore } from '@/stores/shop/cart';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useUserStore } from '@/stores/auth/user';
import { isChatbotConfigured, sendChatMessage } from '@/services/chatbotService';

const uiStore = useUIStore();
const productsStore = useProductsStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const userStore = useUserStore();
const router = useRouter();

const welcomeMessage = 'Greetings. I am your **TechHub Concierge**. I can search the live catalog, compare products, explain specs, and recommend premium hardware from TechHub.';
const input = ref('');
const feed = ref(null);
const messages = ref([{ bot: true, text: welcomeMessage }]);
const isSubmitting = ref(false);
const error = ref('');
const lastPrompt = ref('');
const showSuggestions = ref(true);
let activeRequest;

const suggestions = [
  'Latest Deals',
  'Workstation Recommendations',
  'Compare Smartphones',
  'In-stock premium products'
];

const stripText = (value, max = 240) => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, max);

const catalog = computed(() => productsStore.products.slice(0, 40).map((product) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: product.price,
  category: product.category,
  brand: product.brand,
  inStock: product.inStock,
  stock: product.stock,
  description: stripText(product.desc || product.short_description || product.description),
})));

const currentProduct = computed(() => {
  const id = router.currentRoute.value.params?.id;
  if (!id) return null;
  const product = productsStore.singleProduct || productsStore.products.find((item) => (
    [item.id, item.slug].some((value) => String(value) === String(id))
  ));
  if (!product) return null;
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    brand: product.brand,
    inStock: product.inStock,
    stock: product.stock
  };
});

const platformContext = computed(() => ({
  route: router.currentRoute.value.fullPath,
  auth: { isAuthenticated: userStore.isAuthenticated },
  cart: {
    itemCount: cartStore.itemCount,
    subtotal: cartStore.subtotal,
    hasUnavailableItems: cartStore.hasUnavailableItems
  },
  wishlist: { itemCount: wishlistStore.productIds.length },
  currentProduct: currentProduct.value
}));

const detectProduct = (text) => {
  const normalized = String(text || '').toLowerCase();
  return [...productsStore.products]
    .sort((a, b) => String(b.name || '').length - String(a.name || '').length)
    .find((product) => product.name && normalized.includes(String(product.name).toLowerCase()));
};

const ensureCatalog = async () => {
  if (!productsStore.hasFetched && !productsStore.loading) {
    await productsStore.fetchProducts().catch(() => {});
  }
};

const scroll = async () => {
  await nextTick();
  feed.value?.scrollTo({ top: feed.value.scrollHeight, behavior: 'smooth' });
};

const send = async (preset) => {
  const text = String(preset || input.value).trim().slice(0, 4000);
  if (!text || isSubmitting.value || !isChatbotConfigured) return;

  messages.value.push({ bot: false, text });
  input.value = '';
  error.value = '';
  lastPrompt.value = text;
  showSuggestions.value = false;
  const botIndex = messages.value.push({ bot: true, text: '', streaming: true }) - 1;
  isSubmitting.value = true;
  activeRequest = new AbortController();
  await scroll();
  await ensureCatalog();

  try {
    const conversation = messages.value
      .slice(-12, -1)
      .filter((message) => message.text)
      .map((message) => ({ role: message.bot ? 'assistant' : 'user', content: message.text }));

    const reply = await sendChatMessage({
      message: text,
      conversation,
      catalog: catalog.value,
      context: platformContext.value,
      signal: activeRequest.signal
    });

    messages.value[botIndex].text = reply;
    messages.value[botIndex].product = detectProduct(reply);
  } catch (requestError) {
    messages.value.splice(botIndex, 1);
    error.value = requestError.message || 'The chat service is unavailable.';
  } finally {
    isSubmitting.value = false;
    activeRequest = undefined;
    const botMessage = messages.value[botIndex];
    if (botMessage) botMessage.streaming = false;
    await scroll();
  }
};

const resetConversation = () => {
  activeRequest?.abort();
  messages.value = [{ bot: true, text: welcomeMessage }];
  input.value = '';
  error.value = '';
  showSuggestions.value = true;
};

const openProduct = (product) => {
  const target = product?.slug || product?.id;
  if (!target) return;
  uiStore.chatWindowOpen = false;
  router.push(`/products/${target}`);
};

onMounted(() => {
  ensureCatalog();
});

watch(() => uiStore.chatWindowOpen, (open) => {
  if (open) {
    ensureCatalog();
    scroll();
  }
});
</script>

<template>
  <div class="fixed bottom-24 right-6 z-[100] font-sans">
    <button
      type="button"
      class="group relative flex h-15 w-15 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_18px_50px_rgba(139,107,71,0.35)] transition-all duration-500 hover:-translate-y-1 hover:bg-[var(--accent-dk)] active:scale-95"
      :aria-label="uiStore.chatWindowOpen ? 'Close TechHub Concierge' : 'Open TechHub Concierge'"
      :aria-expanded="uiStore.chatWindowOpen"
      style="animation: chatbotPulse 3s infinite"
      @click="uiStore.toggleChat()"
    >
      <span class="absolute inset-0 rounded-full border border-white/25" aria-hidden="true"></span>
      <i :class="uiStore.chatWindowOpen ? 'fa-solid fa-chevron-down text-lg' : 'fa-solid fa-comments text-lg'" aria-hidden="true"></i>
    </button>

    <section
      v-if="uiStore.chatWindowOpen"
      aria-label="TechHub Concierge"
      class="absolute bottom-20 right-0 flex h-[620px] max-h-[76vh] w-[92vw] max-w-[430px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-card)] shadow-[0_28px_100px_rgba(0,0,0,0.22)]"
    >
      <header class="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-muted)] px-5 py-4">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70" aria-hidden="true"></div>
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-white shadow-inner">
              <i class="fa-solid fa-robot" aria-hidden="true"></i>
            </div>
            <div class="min-w-0">
              <h2 class="truncate font-[Playfair_Display] text-base font-bold text-[var(--text)]">TechHub Concierge</h2>
              <div class="mt-1 flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" aria-hidden="true"></span>
                <p class="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {{ productsStore.loading ? 'Syncing catalog' : 'OpenRouter DeepSeek active' }}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Reset conversation"
            @click="resetConversation"
          >
            <i class="fa-solid fa-rotate-left text-xs" aria-hidden="true"></i>
          </button>
        </div>
      </header>

      <div ref="feed" class="custom-scrollbar flex-1 space-y-5 overflow-y-auto bg-[var(--bg)]/40 p-5" aria-live="polite">
        <div v-for="(message, index) in messages" :key="index" class="flex" :class="message.bot ? 'justify-start' : 'justify-end'">
          <article
            class="max-w-[88%] rounded-b-2xl px-5 py-4 text-[13px] leading-relaxed"
            :class="message.bot ? 'rounded-tr-2xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] shadow-[0_12px_36px_var(--glow)]' : 'rounded-tl-2xl bg-[var(--accent)] text-white shadow-lg'"
          >
            <p v-if="message.text" class="chat-markdown whitespace-pre-line">{{ message.text }}</p>
            <div v-else class="flex items-center gap-1.5 py-1">
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]"></span>
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:0.15s]"></span>
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:0.3s]"></span>
            </div>

            <div v-if="message.product" class="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)] p-3">
              <img v-if="message.product.img" :src="message.product.img" :alt="message.product.name" class="h-14 w-14 rounded-xl object-cover">
              <div class="min-w-0 flex-1">
                <p class="truncate text-[11px] font-bold text-[var(--text)]">{{ message.product.name }}</p>
                <p class="mt-0.5 text-[11px] font-bold text-[var(--accent)]">${{ Number(message.product.price || 0).toFixed(2) }}</p>
              </div>
              <button type="button" class="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)] text-white transition hover:bg-[var(--accent-dk)]" aria-label="Open product" @click="openProduct(message.product)">
                <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
              </button>
            </div>
          </article>
        </div>

        <div v-if="error" role="alert" class="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-700">
          <p>{{ error }}</p>
          <button type="button" class="mt-2 font-bold underline disabled:opacity-50" :disabled="isSubmitting" @click="send(lastPrompt)">Retry</button>
        </div>
      </div>

      <footer class="space-y-3 border-t border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div v-if="showSuggestions" class="flex flex-wrap gap-2">
          <button
            v-for="item in suggestions"
            :key="item"
            type="button"
            class="rounded-full border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
            :disabled="isSubmitting"
            @click="send(item)"
          >
            {{ item }}
          </button>
        </div>
        <form class="flex gap-2" @submit.prevent="send()">
          <label for="assistant-message" class="sr-only">Ask TechHub Concierge</label>
          <input
            id="assistant-message"
            v-model="input"
            maxlength="4000"
            autocomplete="off"
            class="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] disabled:opacity-60"
            :disabled="isSubmitting"
            placeholder="Ask about products, deals, specs..."
          >
          <button
            type="submit"
            class="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent)] text-white shadow-lg transition hover:bg-[var(--accent-dk)] active:scale-95 disabled:opacity-50"
            :disabled="!input.trim() || isSubmitting"
            aria-label="Send message"
          >
            <i class="fa-solid fa-paper-plane text-xs" aria-hidden="true"></i>
          </button>
        </form>
      </footer>
    </section>
  </div>
</template>
