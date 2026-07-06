<template>
  <div class="min-h-screen flex flex-col relative">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div id="cursor-dot" ref="dot"></div>
    <div id="cursor-ring" ref="ring"></div>

    <template v-if="!isAdmin">
      <SearchModal />
      <AuthModal />
      <QuickViewModal />
      <CartDrawer />
      <ChatWidget />
      <CompareModal />
    </template>
    <ToastNotification />

    <Transition v-if="!isAdmin" name="slide-up">
      <div v-if="productsStore.compareIds.length > 0"
        class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-6">
        <div
          class="bg-black/90 dark:bg-[var(--bg-card)]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="flex -space-x-4">
              <img v-for="p in productsStore.compareProducts" :key="p.id" :src="p.img"
                class="w-12 h-12 rounded-full border-2 border-black object-cover" />
            </div>
            <div>
              <p class="text-white text-xs font-bold uppercase tracking-widest">Comparison Queue</p>
              <p class="text-white/50 text-[10px] uppercase tracking-widest">{{ productsStore.compareIds.length }} / 3
                Selected</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button @click="productsStore.compareIds = []"
              class="text-white/60 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Clear</button>
            <button @click="uiStore.compareModalOpen = true"
              class="bg-[var(--accent)] text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest premium-btn"
              :disabled="productsStore.compareIds.length < 2">
              Run Analysis
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Navbar v-if="!isAdmin" />

    <main id="main-content" class="flex-grow" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer v-if="!isAdmin" />

    <div v-if="!isAdmin && !uiStore.cartDrawerOpen" class="fixed bottom-6 right-6 z-[100] float-cart-btn">
      <button @click="uiStore.toggleCart()"
        class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-5 py-3.5 rounded-full shadow-2xl shadow-[var(--glow)] flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl premium-btn group">
        <i class="fa-solid fa-cart-shopping text-sm group-hover:scale-110 transition-transform duration-300"></i>
        <span class="text-sm font-semibold">Cart</span>
        <span
          class="bg-white text-[var(--accent)] w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
          {{ cartStore.itemCount }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '@/stores/shop/cart';
import { useUIStore } from '@/stores/ui/ui';
import { useProductsStore } from '@/stores/shop/products';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';
import ToastNotification from './components/layout/ToastNotification.vue';
const SearchModal = defineAsyncComponent(() => import('./components/modals/SearchModal.vue'));
const AuthModal = defineAsyncComponent(() => import('./components/modals/AuthModal.vue'));
const QuickViewModal = defineAsyncComponent(() => import('./components/modals/QuickViewModal.vue'));
const CartDrawer = defineAsyncComponent(() => import('./components/layout/CartDrawer.vue'));
const ChatWidget = defineAsyncComponent(() => import('./components/ui/ChatWidget.vue'));
const CompareModal = defineAsyncComponent(() => import('./components/modals/CompareModal.vue'));

const cartStore = useCartStore();
const productsStore = useProductsStore();
const uiStore = useUIStore();
const route = useRoute();
const isAdmin = computed(() => route.matched.some((record) => record.meta.admin));

const dot = ref(null);
const ring = ref(null);
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
let animationFrame = 0;

const handleMouseMove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (dot.value) {
    dot.value.style.left = mouseX + 'px';
    dot.value.style.top = mouseY + 'px';
  }
};

const animateRing = () => {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (ring.value) {
    ring.value.style.left = ringX + 'px';
    ring.value.style.top = ringY + 'px';
  }
  animationFrame = requestAnimationFrame(animateRing);
};

const handleInteraction = (isHover) => {
  document.body.classList.toggle('cursor-hover', isHover);
};

const handleMouseOver = (event) => {
  if (event.target.closest('a, button, .cat-card, .product-card, .trust-card, .why-card')) handleInteraction(true);
};

const handleMouseOut = (event) => {
  if (event.target.closest('a, button, .cat-card, .product-card, .trust-card, .why-card')) handleInteraction(false);
};

const closeOverlays = () => {
  uiStore.searchModalOpen = false;
  uiStore.authModalOpen = false;
  uiStore.cartDrawerOpen = false;
  uiStore.chatWindowOpen = false;
  uiStore.quickViewProductId = null;
  uiStore.compareModalOpen = false;
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeOverlays();
};

watch(
  () => [
    uiStore.searchModalOpen,
    uiStore.authModalOpen,
    uiStore.cartDrawerOpen,
    uiStore.chatWindowOpen,
    Boolean(uiStore.quickViewProductId),
    uiStore.compareModalOpen,
  ],
  (states) => document.body.classList.toggle('overlay-open', states.some(Boolean)),
  { deep: true }
);

onMounted(() => {
  if (!isAdmin.value) productsStore.fetchProducts();
  window.addEventListener('mousemove', handleMouseMove);

  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('keydown', handleKeydown);

  animateRing();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('keydown', handleKeydown);
  cancelAnimationFrame(animationFrame);
  document.body.classList.remove('cursor-hover');
  document.body.classList.remove('overlay-open');
});
</script>

<style>
#cursor-dot,
#cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  border-radius: 50%;
  transform: translate3d(-50%, -50%, 0);
  will-change: transform;
}

@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  #cursor-dot,
  #cursor-ring {
    display: none;
  }
}

.overlay-open {
  overflow: hidden;
}

.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10000;
  transform: translateY(-150%);
  background: var(--text);
  color: var(--bg);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}

.skip-link:focus {
  transform: translateY(0);
}

:where(a, button, input, select, textarea):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

#cursor-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
}

#cursor-ring {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--accent);
  opacity: 0.6;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
