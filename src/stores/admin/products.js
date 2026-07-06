import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { adminApi } from '@/services/adminApi';
import { normalizeProduct } from '@/services/normalizers';

export const useAdminProductsStore = defineStore('adminProducts', () => {
  const items = ref([]); const loading = ref(false); const error = ref(''); const query = ref('');
  const filtered = computed(() => {
    const needle = query.value.trim().toLowerCase();
    return needle ? items.value.filter((item) => [item.name, item.brand, item.category, item.sku].some((value) => String(value || '').toLowerCase().includes(needle))) : items.value;
  });
  const load = async () => {
    loading.value = true; error.value = '';
    try { items.value = (await adminApi.listProducts()).map(normalizeProduct); }
    catch (value) { error.value = value.message || 'Unable to load products.'; }
    finally { loading.value = false; }
  };
  return { items, filtered, loading, error, query, load };
});
