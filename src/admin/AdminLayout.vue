<template>
  <div class="admin-shell">
    <button v-if="drawerOpen" class="admin-backdrop" aria-label="Close navigation" @click="drawerOpen = false"></button>
    <aside class="admin-sidebar" :class="{ open: drawerOpen }">
      <div class="admin-brand">
        <span class="admin-brand-mark">T</span>
        <div><strong>TechHub</strong><small>Control room</small></div>
        <button class="admin-icon mobile-only" aria-label="Close navigation" @click="drawerOpen = false"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="demo-chip"><span></span> Read-only demo</div>
      <nav aria-label="Admin navigation">
        <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" @click="drawerOpen = false">
          <i :class="item.icon"></i><span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <RouterLink to="/" class="storefront-link"><i class="fa-solid fa-arrow-left"></i> Return to storefront</RouterLink>
    </aside>
    <section class="admin-stage">
      <header class="admin-topbar">
        <button class="admin-icon mobile-only" aria-label="Open navigation" @click="drawerOpen = true"><i class="fa-solid fa-bars"></i></button>
        <div class="admin-search"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" aria-label="Search admin navigation" placeholder="Search workspace…" @keydown.enter="goToMatch"></div>
        <div class="topbar-actions">
          <button class="admin-icon" :aria-label="dark ? 'Use light theme' : 'Use dark theme'" @click="toggleTheme"><i :class="dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i></button>
          <button class="admin-icon" aria-label="Notifications"><i class="fa-regular fa-bell"></i><span class="notification-dot"></span></button>
          <div class="admin-profile"><span>TH</span><div><strong>Demo operator</strong><small>No write access</small></div></div>
        </div>
      </header>
      <main class="admin-main">
        <div class="admin-crumbs"><RouterLink to="/admin/overview">Admin</RouterLink><i class="fa-solid fa-chevron-right"></i><span>{{ route.meta.adminTitle }}</span></div>
        <RouterView />
      </main>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute(); const router = useRouter(); const drawerOpen = ref(false); const search = ref('');
const dark = ref(document.documentElement.classList.contains('dark'));
const navigation = [
  ['Overview','/admin/overview','fa-solid fa-chart-pie'], ['Products','/admin/products','fa-solid fa-box'],
  ['Categories','/admin/categories','fa-solid fa-grid-2'], ['Brands','/admin/brands','fa-solid fa-copyright'],
  ['Orders','/admin/orders','fa-solid fa-receipt'], ['Customers','/admin/customers','fa-solid fa-users'],
  ['Banners','/admin/banners','fa-regular fa-image'], ['Promotions','/admin/promotions','fa-solid fa-tags'],
  ['Inventory','/admin/inventory','fa-solid fa-warehouse'], ['Reviews','/admin/reviews','fa-regular fa-star'],
  ['Settings','/admin/settings','fa-solid fa-sliders'],
].map(([label,to,icon]) => ({ label,to,icon }));
const toggleTheme = () => { dark.value = !dark.value; document.documentElement.classList.toggle('dark', dark.value); };
const goToMatch = () => { const match = navigation.find((item) => item.label.toLowerCase().includes(search.value.trim().toLowerCase())); if (match) router.push(match.to); };
</script>
