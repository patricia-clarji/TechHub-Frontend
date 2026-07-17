import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { mediaAPI, brandAPI } from '@/services/osimart';
import logger from '@/utils/logger';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeBrand = (raw = {}) => {
    logger.debug('Normalizing brand:', raw);
    
    let logoUrl = '';
    if (raw.logo) {
        if (typeof raw.logo === 'string') {
            logoUrl = raw.logo;
        } else if (typeof raw.logo === 'object' && raw.logo.path) {
            logoUrl = raw.logo.path;
        } else if (typeof raw.logo === 'object' && raw.logo.url) {
            logoUrl = raw.logo.url;
        }
    }
    
    return {
        id: pick(raw.id, raw.pk, raw.uuid, raw.brand_id),
        name: pick(raw.name, raw.title, raw.brand_name, 'Unnamed Brand'),
        slug: pick(raw.slugified_name, raw.slug, raw.name?.toLowerCase().replace(/\s+/g, '-')),
        description: pick(raw.description, raw.desc, raw.summary, raw.about, ''),
        logo: mediaAPI.getImageUrl(logoUrl) || mediaAPI.getImageUrl(raw.logo),
        image: mediaAPI.getImageUrl(pick(raw.image, raw.image_url, raw.logo, raw.thumbnail, raw.banner)),
        is_active: Boolean(!raw.archived_at && !raw.unlisted_at && pick(raw.is_active, raw.active, raw.enabled, true)),
        product_count: pick(raw.product_count, raw.products_count, raw.count, 0),
        website: pick(raw.website, raw.url, raw.site, ''),
        store: pick(raw.store, raw.store_id, raw.store_uuid, ''),
        created_at: raw.created_at,
        raw,
    };
};

export const useBrandsStore = defineStore('brands', () => {
    const brands = ref([]);
    const loading = ref(false);
    const error = ref('');
    const hasFetched = ref(false);

    const fetchBrands = async (params = {}, options = {}) => {
        if (loading.value || (hasFetched.value && !options.force)) return brands.value;

        loading.value = true;
        error.value = '';

        try {
            const apiParams = {
                page: 1,
                page_size: 100,
                ...params
            };
            
            logger.debug('Fetching brands with params:', apiParams);
            const response = await brandAPI.list(apiParams);
            logger.debug('Brands response:', response);
            
            // Handle different response structures
            let brandData = response;
            if (!Array.isArray(response)) {
                brandData = response.results || response.data || response.items || [];
                logger.debug('Extracted brands from response:', brandData);
            }
            
            if (!Array.isArray(brandData)) {
                logger.error('Brand data is not an array:', brandData);
                return brands.value;
            }
            logger.debug(`Raw brands count: ${brandData.length}`);
            
            // Log each brand to see what we're getting
            brandData.forEach((brand, index) => {
                logger.debug(`Brand ${index + 1}:`, {
                    id: brand.id,
                    name: brand.name,
                    slugified_name: brand.slugified_name,
                    logo: brand.logo,
                    store: brand.store
                });
            });
            
            logger.debug('Normalizing brands...');
            const normalizedBrands = brandData
                .filter(item => item && typeof item === 'object')
                .map(normalizeBrand)
                .filter((brand) => brand.id && brand.id !== '');
            
            logger.debug(`Normalized ${normalizedBrands.length} brands`);
            
            // Log normalized brands with their names
            normalizedBrands.forEach((brand, index) => {
                logger.debug(`Normalized brand ${index + 1}:`, {
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                    is_active: brand.is_active
                });
            });
            
            if (normalizedBrands.length > 0) {
                brands.value = normalizedBrands;
                logger.debug('Brands store updated successfully');
                logger.debug('Brand names:', brands.value.map(b => b.name));
            } else {
                logger.warn('No brands returned from API');
            }
            
            hasFetched.value = true;
            return brands.value;
        } catch (err) {
            const errorMsg = err?.response?.data?.detail || err?.message || 'Unable to load Osimart brands.';
            error.value = errorMsg;
            hasFetched.value = true;
            logger.error('Error fetching brands:', errorMsg);
            logger.error('Full error:', err);
            brands.value = [];
            return [];
        } finally {
            loading.value = false;
        }
    };

    const getBrandById = (id) => {
        return brands.value.find(brand => String(brand.id) === String(id));
    };

    const getBrandByName = (name) => {
        if (!name) return null;
        return brands.value.find(brand => 
            brand.name.toLowerCase() === name.toLowerCase() ||
            brand.slug?.toLowerCase() === name.toLowerCase()
        );
    };

    const getActiveBrands = () => {
        return brands.value.filter(brand => brand.is_active);
    };

    const brandNames = computed(() => {
        const active = brands.value.filter(b => b.is_active);
        logger.debug('Active brands for display:', active.map(b => b.name));
        return active.slice(0, 8).map(b => b.name);
    });

    // Get brands as options for filters (used by products store)
    const brandOptions = computed(() => {
        return brands.value
            .filter(b => b.is_active)
            .map(b => ({
                label: b.name,
                value: b.name,
                id: b.id
            }));
    });

    return {
        brands,
        loading,
        error,
        hasFetched,
        fetchBrands,
        getBrandById,
        getBrandByName,
        getActiveBrands,
        brandNames,
        brandOptions,
    };
});
