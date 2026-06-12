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
    <ChatWidget v-if="uiStore.chatWindowOpen" />
    <ToastNotification />

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
    <div v-if="!uiStore.cartDrawerOpen" class="fixed bottom-6 right-6 z-50 float-cart-btn">
      <button @click="uiStore.toggleCart()" 
        class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-5 py-3.5 rounded-full shadow-2xl shadow-[var(--glow)] flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl premium-btn group">
        <i class="fa-solid fa-cart-shopping text-sm group-hover:scale-110 transition-transform duration-300"></i>
        <span class="text-sm font-semibold">Cart</span>
        <span class="bg-white text-[var(--accent)] w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
          {{ cartStore.itemCount }}
        </span>
      </button>
    </div>

    <!-- Chatbot Toggle -->
    <div id="chatbot-container" class="fixed bottom-24 right-6 z-50">
      <button @click="uiStore.toggleChat()"
        class="w-14 h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-[var(--glow)] flex items-center justify-center premium-btn"
        style="animation: chatbotPulse 2.5s infinite">
        <i :class="uiStore.chatWindowOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-comments'" class="text-lg"></i>
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
    dot.value.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }
};

const animateRing = () => {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (ring.value) {
    ring.value.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
  }
  requestAnimationFrame(animateRing);
};

const handleInteraction = (isHover) => {
  document.body.classList.toggle('cursor-hover', isHover);
};

onMounted(() => {
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
#cursor-dot, #cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  border-radius: 50%;
  transform: translate3d(-50%, -50%, 0);
  will-change: transform;
}
#cursor-dot { width: 8px; height: 8px; background: var(--accent); }
#cursor-ring { width: 36px; height: 36px; border: 1.5px solid var(--accent); opacity: 0.6; }

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
</style>