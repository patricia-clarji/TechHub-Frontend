import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { adminApi } from '@/services/adminApi';
import { normalizeProduct } from '@/services/normalizers';

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref('');
  const loaded = ref(false);
  const metrics = computed(() => ({
    products: products.value.length,
    lowStock: products.value.filter((item) => item.stock > 0 && item.stock <= 5).length,
    outOfStock: products.value.filter((item) => !item.inStock).length,
    inventoryUnits: products.value.reduce((sum, item) => sum + Number(item.stock || 0), 0),
  }));
  const load = async (force = false) => {
    if (loaded.value && !force) return;
    loading.value = true; error.value = '';
    try {
      products.value = (await adminApi.listProducts()).map(normalizeProduct);
      loaded.value = true;
    } catch (errorValue) {
      error.value = errorValue.message || 'Unable to load catalog analytics.';
    } finally { loading.value = false; }
  };
  return { products, loading, error, metrics, load };
});
