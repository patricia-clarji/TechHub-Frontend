import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bannerAPI, mediaAPI, getOsimartStoreId } from '@/services/osimart';
import logger from '@/utils/logger';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');
const normalizeId = (value) => String(value || '').trim().toLowerCase();

const normalizeBanner = (raw = {}) => {
    logger.debug('Normalizing banner:', raw);
    
    const image = mediaAPI.getImageUrl(
        pick(
            raw.image,
            raw.image_url,
            raw.desktop_image,
            raw.desktop,
            raw.banner,
            raw.background,
            raw.cover,
            raw.file,
            raw.media,
            raw.main_image
        )
    );
    
    const mobile_image = mediaAPI.getImageUrl(
        pick(
            raw.mobile_image,
            raw.mobile,
            raw.mobile_banner,
            raw.image,
            raw.image_url
        )
    );

    return {
        id: pick(raw.id, raw.pk, raw.uuid, raw.slug, raw.title),
        image: image || mobile_image,
        mobile_image: mobile_image || image,
        title: pick(raw.title, raw.name, raw.heading, raw.banner_title, ''),
        subtitle: pick(raw.subtitle, raw.description, raw.text, raw.banner_subtitle, ''),
        button: pick(raw.button_title, raw.button, raw.button_text, raw.cta, raw.cta_text, raw.button_label, ''),
        link: pick(raw.link, raw.url, raw.href, raw.button_link, ''),
        store: pick(raw.store, raw.store_id, raw.store_uuid, raw.store?.id, raw.store?.uuid, ''),
        is_active: Boolean(pick(raw.is_active, raw.active, raw.enabled, true)),
        order: pick(raw.order, raw.position, raw.sort_order, 0),
        raw,
    };
};

export const useOsimartBannersStore = defineStore('osimartBanners', () => {
    const banners = ref([]);
    const loading = ref(false);
    const error = ref('');
    const hasFetched = ref(false);

    const fetchBanners = async (params = {}, options = {}) => {
        if (loading.value || (hasFetched.value && !options.force)) return banners.value;

        loading.value = true;
        error.value = '';

        try {
            logger.debug('Fetching banners...');
            const response = await bannerAPI.list(params);
            logger.debug('Banners API response:', response);
            
            const storeId = normalizeId(getOsimartStoreId());
            logger.debug('Store ID:', storeId);
            
            const normalized = response
                .filter(item => item && typeof item === 'object')
                .map(normalizeBanner)
                .filter((banner) => banner.id || banner.image);
            
            logger.debug(`Normalized ${normalized.length} banners`);
            logger.debug('Banner summary:', normalized.map((b) => ({ id: b.id, title: b.title, store: b.store, image: b.image ? 'has image' : 'no image' })));
            
            // Filter banners by store ID if store is specified
            const storeBanners = normalized.filter(
                (banner) =>
                    !banner.store || // If no store specified, include it
                    (banner.store && normalizeId(banner.store) === storeId)
            );

            banners.value = storeBanners.length > 0 ? storeBanners : normalized;
            logger.debug(`Final banners: ${banners.value.length} banners loaded`);
            
            hasFetched.value = true;
            return banners.value;
        } catch (err) {
            const errorMsg = err?.response?.data?.detail || err?.message || 'Unable to load Osimart banners.';
            error.value = errorMsg;
            logger.error('Error fetching banners:', errorMsg);
            logger.error('Full error:', err);
            banners.value = [];
            return [];
        } finally {
            loading.value = false;
        }
    };

    const getActiveBanners = () => {
        return banners.value.filter(banner => banner.is_active);
    };

    const getBannerById = (id) => {
        return banners.value.find(banner => String(banner.id) === String(id));
    };

    return {
        banners,
        loading,
        error,
        hasFetched,
        fetchBanners,
        getActiveBanners,
        getBannerById,
    };
});