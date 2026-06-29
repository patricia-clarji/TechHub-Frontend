<template>
  <div class="min-h-screen flex flex-col relative">
    <!-- Custom Premium Cursor -->
    <div id="cursor-dot" ref="dot"></div>
    <div id="cursor-ring" ref="ring"></div>

    <!-- Global Premium Overlays -->
    <SearchModal />
    <AuthModal />
    <QuickViewModal />
    <CartDrawer />
    <ChatWidget />
    <ToastNotification />
    <CompareModal />

    <!-- Comparison Overlay (Premium Feature) -->
    <Transition name="slide-up">
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

    <Navbar />

    <main class="flex-grow">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer />

    <!-- Floating Cart Toggle -->
    <div v-if="!uiStore.cartDrawerOpen" class="fixed bottom-6 right-6 z-[100] float-cart-btn">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { useProductsStore } from '@/stores/products';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';
import SearchModal from './components/modals/SearchModal.vue';
import AuthModal from './components/modals/AuthModal.vue';
import QuickViewModal from './components/modals/QuickViewModal.vue';
import CartDrawer from './components/layout/CartDrawer.vue';
import ChatWidget from './components/ui/ChatWidget.vue';
import ToastNotification from './components/layout/ToastNotification.vue';
import CompareModal from './components/modals/CompareModal.vue';

const cartStore = useCartStore();
const productsStore = useProductsStore();
const uiStore = useUIStore();

const dot = ref(null);
const ring = ref(null);
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

const handleMouseMove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (dot.value) {
    dot.value.style.left = mouseX + 'px';
    dot.value.style.top = mouseY + 'px';
  }
};

const animateRing = () => {
  // Smoother interpolation for the ring
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (ring.value) {
    ring.value.style.left = ringX + 'px';
    ring.value.style.top = ringY + 'px';
  }
  requestAnimationFrame(animateRing);
};

const handleInteraction = (isHover) => {
  document.body.classList.toggle('cursor-hover', isHover);
};

onMounted(() => {
  productsStore.fetchProducts();
  window.addEventListener('mousemove', handleMouseMove);

  // Global event delegation for cursor scaling
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .cat-card, .product-card, .trust-card, .why-card');
    if (target) handleInteraction(true);
  });
  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .cat-card, .product-card, .trust-card, .why-card');
    if (target) handleInteraction(false);
  });

  animateRing();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
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