import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useAdminOrdersStore = defineStore('adminOrders', () => {
  const items = ref([]); const loading = ref(false); const error = ref('');
  const load = async () => { items.value = []; error.value = 'Order data requires a server-authorized staff endpoint.'; };
  return { items, loading, error, load };
});
