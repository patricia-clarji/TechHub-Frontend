import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminApi } from '@/services/adminApi';
export const useAdminContentStore = defineStore('adminContent', () => {
  const banners = ref([]); const loading = ref(false); const error = ref('');
  const load = async () => {
    loading.value = true; error.value = '';
    try { banners.value = await adminApi.listBanners(); } catch (value) { error.value = value.message; } finally { loading.value = false; }
  };
  return { banners, loading, error, load };
});
