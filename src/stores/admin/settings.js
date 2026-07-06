import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useAdminSettingsStore = defineStore('adminSettings', () => {
  const preferences = ref({ compactTables: false, reducedMotion: false });
  const updatePreference = (key, value) => { if (key in preferences.value) preferences.value[key] = Boolean(value); };
  return { preferences, updatePreference };
});
