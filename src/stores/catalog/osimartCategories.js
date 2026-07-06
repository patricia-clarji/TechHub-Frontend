import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mediaAPI, categoryAPI } from '@/services/osimart';
import logger from '@/utils/logger';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const toSlug = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeCategory = (raw = {}) => {
    logger.debug('Normalizing category:', raw);
    
    const name = pick(raw.name, raw.title, raw.label, raw.slug, 'Untitled Category');

    return {
        id: pick(raw.id, raw.pk, raw.uuid, raw.slug, raw.category_id),
        name,
        slug: pick(raw.slugified_name, raw.slug, toSlug(name)),
        description: pick(raw.description, raw.desc, raw.summary, raw.about, ''),
        image: mediaAPI.getImageUrl(pick(raw.image, raw.image_url, raw.thumbnail, raw.icon, raw.background, raw.banner_image)),
        is_active: !raw.unlisted_at && !raw.archived_at,
        product_count: pick(raw.product_count, raw.products_count, raw.count, 0),
        parent_id: pick(raw.parent_id, raw.parent, raw.parent_category, null),
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
            const apiParams = {
                page: 1,
                page_size: 50,
                ...params
            };
            
            logger.debug('Fetching categories with params:', apiParams);
            const response = await categoryAPI.list(apiParams);
            logger.debug('Categories response:', response);
            
            // Handle different response structures
            let categoryData = response;
            if (!Array.isArray(response)) {
                categoryData = response.results || response.data || response.items || [];
                logger.debug('Extracted categories from response:', categoryData);
            }
            
            if (!Array.isArray(categoryData)) {
                logger.error('Category data is not an array:', categoryData);
                return categories.value;
            }
            logger.debug('Normalizing categories...');
            const normalizedCategories = categoryData
                .filter(item => item && typeof item === 'object')
                .map(normalizeCategory)
                .filter((category) => category.id && category.id !== '');
            
            logger.debug(`Normalized ${normalizedCategories.length} categories`);
            
            if (normalizedCategories.length > 0) {
                categories.value = normalizedCategories;
                logger.debug('Categories store updated successfully');
            }
            
            hasFetched.value = true;
            return categories.value;
        } catch (err) {
            const errorMsg = err?.response?.data?.detail || err?.message || 'Unable to load Osimart categories.';
            error.value = errorMsg;
            logger.error('Error fetching categories:', errorMsg);
            logger.error('Full error:', err);
            categories.value = [];
            return [];
        } finally {
            loading.value = false;
        }
    };

    const getCategoryById = (id) => {
        return categories.value.find(cat => String(cat.id) === String(id));
    };

    const getCategoryBySlug = (slug) => {
        return categories.value.find(cat => cat.slug === slug);
    };

    const getActiveCategories = () => {
        return categories.value.filter(cat => cat.is_active);
    };

    return {
        categories,
        loading,
        error,
        hasFetched,
        fetchCategories,
        getCategoryById,
        getCategoryBySlug,
        getActiveCategories,
    };
});
