<template>
  <AdminPageHeader title="Operations overview" description="A live catalog pulse with security-conscious placeholders for private commerce analytics.">
    <button class="admin-btn secondary" :disabled="store.loading" @click="store.load(true)"><i class="fa-solid fa-rotate"></i> Refresh</button>
  </AdminPageHeader>
  <div class="admin-notice"><i class="fa-solid fa-shield-halved"></i><div><strong>Safe demo mode</strong><p>Catalog metrics are live. Revenue, orders, customers, and conversion remain hidden until a server-verified staff API is connected.</p></div></div>
  <div v-if="store.loading" class="metric-grid"><div v-for="n in 8" :key="n" class="admin-card skeleton-card"></div></div>
  <template v-else>
    <div class="metric-grid">
      <article v-for="metric in metrics" :key="metric.label" class="admin-card metric-card">
        <span :class="metric.tone"><i :class="metric.icon"></i></span><small>{{ metric.label }}</small><strong>{{ metric.value }}</strong><p>{{ metric.note }}</p>
      </article>
    </div>
    <div class="admin-dashboard-grid">
      <section class="admin-card chart-card"><div class="card-heading"><div><small>Inventory distribution</small><h2>Stock health</h2></div><span>Live</span></div>
        <div class="bar-chart" role="img" aria-label="Visual stock distribution">
          <div v-for="(bar,index) in bars" :key="index" :style="{ height: `${bar}%` }"></div>
        </div><div class="chart-axis"><span>Available inventory by product</span><span>{{ store.metrics.inventoryUnits }} units</span></div>
      </section>
      <section class="admin-card"><div class="card-heading"><div><small>Attention needed</small><h2>Low-stock alerts</h2></div><RouterLink to="/admin/inventory">View all</RouterLink></div>
        <div v-if="lowStock.length" class="activity-list"><div v-for="item in lowStock" :key="item.id"><span class="activity-icon warning"><i class="fa-solid fa-box-open"></i></span><div><strong>{{ item.name }}</strong><small>{{ item.stock }} units remaining</small></div><em>Low</em></div></div>
        <AdminEmptyState v-else title="Stock looks healthy" message="No products are currently between one and five units." icon="fa-solid fa-circle-check" />
      </section>
    </div>
  </template>
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { useAdminDashboardStore } from '@/stores/admin/dashboard';
import AdminPageHeader from '@/admin/components/AdminPageHeader.vue';
import AdminEmptyState from '@/admin/components/AdminEmptyState.vue';
const store = useAdminDashboardStore();
onMounted(() => store.load());
const metrics = computed(() => [
  { label:'Total revenue', value:'Restricted', note:'Requires orders API', icon:'fa-solid fa-dollar-sign', tone:'gold' },
  { label:'Total orders', value:'Restricted', note:'Private commerce data', icon:'fa-solid fa-bag-shopping', tone:'violet' },
  { label:'Total products', value:store.metrics.products, note:'Live Osimart catalog', icon:'fa-solid fa-box', tone:'blue' },
  { label:'Low stock', value:store.metrics.lowStock, note:'Five units or fewer', icon:'fa-solid fa-triangle-exclamation', tone:'orange' },
  { label:'New customers', value:'Restricted', note:'Requires staff scope', icon:'fa-solid fa-user-plus', tone:'green' },
  { label:'Conversion rate', value:'Restricted', note:'Analytics not connected', icon:'fa-solid fa-arrow-trend-up', tone:'blue' },
  { label:'Average order', value:'Restricted', note:'Requires orders API', icon:'fa-solid fa-chart-line', tone:'gold' },
  { label:'Out of stock', value:store.metrics.outOfStock, note:'Live catalog status', icon:'fa-solid fa-ban', tone:'red' },
]);
const lowStock = computed(() => store.products.filter((item) => item.stock > 0 && item.stock <= 5).slice(0,6));
const bars = computed(() => store.products.slice(0,14).map((item) => Math.max(10, Math.min(100, Number(item.stock || 0) * 5))));
</script>
