import axios from "axios";

const OSIMART_API_URL =
    import.meta.env.VITE_OSIMART_BASE_URL ||
    "https://api.osimart.com/store/apis";

const OSIMART_STORE_ID =
    import.meta.env.VITE_OSIMART_STORE_ID?.trim();

const OSIMART_TOKEN =
    import.meta.env.VITE_OSIMART_TOKEN || "";

const osimart = axios.create({
    baseURL: OSIMART_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================
// Request Interceptor
// ============================================

osimart.interceptors.request.use((config) => {
    const token =
        OSIMART_TOKEN ||
        localStorage.getItem("osimart_access") ||
        localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`;
    }

    config.params = {
        store: OSIMART_STORE_ID,
        ...(config.params || {}),
    };

    return config;
});

// ============================================
// Response Interceptor
// ============================================

osimart.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("OSIMART ERROR:", error);
        return Promise.reject(error);
    }
);

// ============================================
// Helpers
// ============================================

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const normalizeUrl = (value) => {
    if (!value || typeof value !== "string") return "";

    if (isAbsoluteUrl(value)) return value;

    if (value.startsWith("//")) return `https:${value}`;

    const cleanPath = value.replace(/^\/+/, "");

    return `https://api.osimart.com/${cleanPath}`;
};

const firstDefined = (...values) =>
    values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );

const extractList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.objects)) return payload.objects;
    return [];
};

// ============================================
// Media API
// ============================================

export const mediaAPI = {
    getImageUrl(value) {
        if (!value) return "";

        if (Array.isArray(value)) {
            const first = value
                .map((item) => mediaAPI.getImageUrl(item))
                .find(Boolean);

            return first || "";
        }

        if (typeof value === "string") {
            return normalizeUrl(value);
        }

        if (typeof value === "object") {
            return mediaAPI.getImageUrl(
                firstDefined(
                    value.url,
                    value.image_url,
                    value.image,
                    value.main_image,
                    value.thumbnail,
                    value.path,
                    value.file,
                    value.src
                )
            );
        }

        return "";
    },
};

// ============================================
// Banner API
// ============================================

export const bannerAPI = {
    async list(params = {}) {
        const response = await osimart.get("/banners/", {
            params,
        });

        return extractList(response.data);
    },
};

// ============================================
// PRODUCT API
// ============================================

export const productAPI = {
    async list(params = {}) {
        try {
            const response = await osimart.get("/products/", {
                params,
            });

            return extractList(response.data);
        } catch (error) {
            console.error("Product API Error:", error);
            return [];
        }
    },

    async detail(id) {
        try {
            const response = await osimart.get(`/products/${id}/`);
            return response.data;
        } catch (error) {
            console.error("Product Detail Error:", error);
            return null;
        }
    },
};

// ============================================
// CATEGORY API
// ============================================

export const categoryAPI = {
    async list(params = {}) {
        try {
            const response = await osimart.get("/categories/", {
                params,
            });

            return extractList(response.data);
        } catch (error) {
            console.error("Category API Error:", error);
            return [];
        }
    },
};

export const getOsimartStoreId = () => OSIMART_STORE_ID;

export default osimart;