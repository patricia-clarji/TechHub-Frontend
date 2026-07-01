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

    // Always add store parameter to all requests
    if (OSIMART_STORE_ID) {
        config.params = {
            store: OSIMART_STORE_ID,
            ...(config.params || {}),
        };
    }

    console.log(`Making ${config.method.toUpperCase()} request to:`, config.url, "with params:", config.params);

    return config;
});

// ============================================
// Response Interceptor
// ============================================

osimart.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error("OSIMART ERROR:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                params: error.config?.params,
            }
        });
        
        // Handle authentication errors
        if (error.response?.status === 401) {
            console.warn("Authentication failed - check your token");
        }
        
        // Handle not found errors
        if (error.response?.status === 404) {
            console.warn("Endpoint not found - check your URL");
        }
        
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
    // Handle different response structures
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.objects)) return payload.objects;
    // If it's a single object with a results property
    if (payload?.results && typeof payload.results === 'object') {
        return Array.isArray(payload.results) ? payload.results : [payload.results];
    }
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
        try {
            const response = await osimart.get("/banners/", {
                params,
            });
            console.log("BANNER RAW RESPONSE:", response.data);
            const data = extractList(response.data);
            console.log("BANNER PARSED DATA:", data);
            return data;
        } catch (error) {
            console.error("BANNER ERROR:", error);
            return [];
        }
    },
};

// ============================================
// PRODUCT API
// ============================================

export const productAPI = {
    async list(params = {}) {
        try {
            const response = await osimart.get("/products/", {
                params: {
                    ...params,
                    // Add any default params here
                },
            });

            console.log("PRODUCT STATUS:", response.status);
            console.log("PRODUCT RAW RESPONSE:", response.data);
            
            const data = extractList(response.data);
            console.log("PRODUCT PARSED DATA:", data);
            console.log("PRODUCT COUNT:", data.length);
            
            return data;
        } catch (error) {
            console.error("PRODUCT ERROR:", error.response || error);
            console.error("ERROR DATA:", error.response?.data);
            console.error("ERROR STATUS:", error.response?.status);
            return [];
        }
    },
    async detail(id) {
        try {
            const response = await osimart.get(`/products/${id}/`);
            console.log("PRODUCT DETAIL STATUS:", response.status);
            console.log("PRODUCT DETAIL DATA:", response.data);
            return response.data;
        } catch (error) {
            console.error("PRODUCT DETAIL ERROR:", error.response || error);
            console.error("DATA:", error.response?.data);
            console.error("STATUS:", error.response?.status);
            throw error;
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

            console.log("CATEGORY STATUS:", response.status);
            console.log("CATEGORY RAW RESPONSE:", response.data);
            
            const data = extractList(response.data);
            console.log("CATEGORY PARSED DATA:", data);
            console.log("CATEGORY COUNT:", data.length);
            
            return data;
        } catch (error) {
            console.error("CATEGORY ERROR:", error.response || error);
            console.error("ERROR DATA:", error.response?.data);
            console.error("ERROR STATUS:", error.response?.status);
            return [];
        }
    },
};

// ============================================
// BRAND API
// ============================================

export const brandAPI = {
    async list(params = {}) {
        try {
            const response = await osimart.get("/brands/", {
                params,
            });

            console.log("BRAND STATUS:", response.status);
            console.log("BRAND RAW RESPONSE:", response.data);
            
            const data = extractList(response.data);
            console.log("BRAND PARSED DATA:", data);
            console.log("BRAND COUNT:", data.length);
            
            return data;
        } catch (error) {
            console.error("BRAND ERROR:", error.response || error);
            console.error("ERROR DATA:", error.response?.data);
            console.error("ERROR STATUS:", error.response?.status);
            return [];
        }
    },
};

export const getOsimartStoreId = () => OSIMART_STORE_ID;

export default osimart;