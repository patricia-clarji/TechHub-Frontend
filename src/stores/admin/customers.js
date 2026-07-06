import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useAdminCustomersStore = defineStore('adminCustomers', () => {
  const items = ref([]); const loading = ref(false); const error = ref('');
  const load = async () => { items.value = []; error.value = 'Customer data is hidden until a server-authorized staff endpoint is connected.'; };
  return { items, loading, error, load };
});
