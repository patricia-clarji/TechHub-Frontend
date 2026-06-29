import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bannerAPI, mediaAPI, getOsimartStoreId } from '@/services/osimart';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');
const normalizeId = (value) => String(value || '').trim().toLowerCase();

const normalizeBanner = (raw = {}) => ({
    id: pick(raw.id, raw.pk, raw.uuid, raw.slug, raw.title),
    image: mediaAPI.getImageUrl(
        pick(
            raw.image,
            raw.image_url,
            raw.desktop_image,
            raw.desktop,
            raw.banner,
            raw.background,
            raw.cover,
            raw.file,
            raw.media
        )
    ),
    mobile_image: mediaAPI.getImageUrl(
        pick(
            raw.mobile_image,
            raw.mobile,
            raw.mobile_banner,
            raw.image
        )
    ),
    title: pick(raw.title, raw.name, raw.heading, ''),
    subtitle: pick(raw.subtitle, raw.description, raw.text, ''),
    button: pick(raw.button_title, raw.button, raw.button_text, raw.cta, raw.cta_text, ''),
    link: pick(raw.link, raw.url, raw.href, ''),
    store: pick(raw.store, raw.store_id, raw.store_uuid, raw.store?.id, raw.store?.uuid, ''),
    is_active: Boolean(pick(raw.is_active, raw.active, raw.enabled, true)),
    raw,
});

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
            const response = await bannerAPI.list(params);
            console.log("API RESPONSE:", response);
            console.log("STORE ID:", getOsimartStoreId());
            const storeId = normalizeId(getOsimartStoreId());
            const normalized = response.map(normalizeBanner).filter((banner) => banner.id || banner.image);
            console.table(
                normalized.map((b) => ({
                    title: b.title,
                    store: b.store,
                    image: b.image,
                }))
            );
            const storeBanners = normalized.filter(
                (banner) =>
                    banner.store &&
                    normalizeId(banner.store) === storeId
            );

            banners.value =
                storeBanners.length > 0
                    ? storeBanners
                    : normalized;
            console.log("FINAL BANNERS:", banners.value);
            hasFetched.value = true;
            return banners.value;
        } catch (err) {
            error.value = err?.response?.data?.detail || err?.message || 'Unable to load Osimart banners.';
            banners.value = [];
            return [];
        } finally {
            loading.value = false;
        }

    };



    return {
        banners,
        loading,
        error,
        fetchBanners,
    };
});