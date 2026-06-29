import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mediaAPI } from '@/services/osimart';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const toSlug = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeCategory = (raw = {}) => {
    const name = pick(raw.name, raw.title, raw.label, raw.slug, 'Untitled Category');

    return {
        id: pick(raw.id, raw.pk, raw.uuid, raw.slug, name),
        name,
        slug: pick(raw.slug, toSlug(name)),
        description: pick(raw.description, raw.desc, raw.summary, ''),
        image: mediaAPI.getImageUrl(pick(raw.image, raw.image_url, raw.thumbnail, raw.icon, raw.background)),
        is_active: Boolean(pick(raw.is_active, raw.active, raw.enabled, true)),
        raw,
    };
};

export const useOsimartCategoriesStore = defineStore('osimartCategories', () => {
    const categories = ref([]);
    const loading = ref(false);
    const error = ref('');
    const hasFetched = ref(false);

    const fetchCategories = async (params = {}, options = {}) => {
        if (loading.value || (hasFetched.value && !options.force)) return categories.value;

        loading.value = true;
        error.value = '';

        try {
            const response = await categoryAPI.list(params);
            categories.value = response.map(normalizeCategory).filter((category) => category.id);
            hasFetched.value = true;
            return categories.value;
        } catch (err) {
            error.value = err?.response?.data?.detail || err?.message || 'Unable to load Osimart categories.';
            categories.value = [];
            return [];
        } finally {
            loading.value = false;
        }
    };

    return {
        categories,
        loading,
        error,
        fetchCategories,
    };
});