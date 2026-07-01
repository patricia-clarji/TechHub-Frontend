import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { mediaAPI, productAPI } from '@/services/osimart';
import { fallbackProducts } from './fallbackProducts';
import { useBrandsStore } from './brands';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === '') return [];
    return [value];
};

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const toSlug = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeCategory = (raw) => {
    if (!raw) return '';
    if (typeof raw === 'string') return raw;
    return pick(
        raw.name,
        raw.title,
        raw.slug,
        raw.category_name,
        raw.category?.name,
        raw.id,
        ''
    );
};

const normalizeReviews = (raw) => toArray(pick(raw.reviews, raw.ratings, raw.feedback)).map((review, index) => ({
    userId: pick(review.userId, review.user_id, review.user, `review-${index}`),
    userName: pick(review.userName, review.user_name, review.name, 'Customer'),
    rating: toNumber(pick(review.rating, review.stars, review.score), 0),
    comment: pick(review.comment, review.review, review.text, ''),
    date: pick(review.date, review.created_at, review.updated_at, ''),
}));

const normalizeImages = (raw) => {
    const values = [
        ...toArray(raw.images),
        raw.main_image,
        raw.image,
        raw.image_url,
        raw.thumbnail,
        raw.mainImage,
        raw.featured_image,
    ];

    return [...new Set(values.map((image) => mediaAPI.getImageUrl(image)).filter(Boolean))];
};

const normalizeProduct = (raw = {}) => {
    console.log("Normalizing product:", raw);

    const category = normalizeCategory(pick(raw.category, raw.category_name, raw.collection, raw.category_data));
    const categoryId = pick(raw.category_id, raw.category?.id, raw.collection_id, raw.collection?.id, '');
    const categorySlug = pick(raw.category_slug, raw.category?.slug, raw.collection_slug, raw.collection?.slug, toSlug(category));
    const images = normalizeImages(raw);
    const reviews = normalizeReviews(raw);
    const stock = toNumber(pick(raw.stock, raw.quantity, raw.available_quantity, raw.inventory, raw.stock_quantity), 0);
    const isActive = pick(raw.is_active, raw.active, raw.enabled, true);
    const isInStock = pick(raw.inStock, raw.in_stock, raw.available, stock > 0);

    const normalized = {
        id: pick(raw.id, raw.pk, raw.uuid, raw.slug, raw.product_id),
        name: pick(raw.name, raw.title, raw.product_name, raw.productName, 'Untitled Product'),
        slug: pick(raw.slug, toSlug(pick(raw.name, raw.title, raw.product_name, raw.id))),
        price: toNumber(pick(raw.price, raw.sale_price, raw.current_price, raw.unit_price, raw.regular_price), 0),
        oldPrice: toNumber(pick(raw.oldPrice, raw.old_price, raw.compare_at_price, raw.original_price, raw.regular_price), 0),
        description: pick(raw.description, raw.full_description, raw.desc, raw.long_description, ''),
        short_description: pick(raw.short_description, raw.shortDescription, raw.summary, raw.desc, raw.description, ''),
        image: images[0] || '',
        images,
        category,
        category_id: categoryId,
        category_slug: categorySlug,
        badge: pick(raw.badge, raw.label, raw.tagline, raw.badge_text, ''),
        stock,
        rating: toNumber(pick(raw.rating, raw.average_rating, raw.avg_rating, raw.avg_rating), 0),
        review_count: toNumber(pick(raw.review_count, raw.reviews_count, raw.rating_count, reviews.length), reviews.length),
        tags: toArray(pick(raw.tags, raw.keywords, raw.tag_list)),
        features: toArray(pick(raw.features, raw.highlights, raw.specifications_list, raw.benefits)),
        variants: toArray(raw.variants).map((variant, index) => ({
            id: pick(variant.id, variant.pk, variant.sku, `variant-${index}`),
            name: pick(variant.name, variant.title, variant.sku, `Option ${index + 1}`),
            stock: toNumber(pick(variant.stock, variant.quantity, stock), stock),
            priceMod: toNumber(pick(variant.priceMod, variant.price_mod, variant.price_delta), 0),
            ...variant,
        })),
        colors: toArray(raw.colors),
        specifications: raw.specifications || raw.attributes || raw.metadata || raw.specs || {},
        reviews,
        is_active: Boolean(isActive),
        inStock: Boolean(isInStock),
        brand: pick(raw.brand, raw.brand_name, raw.manufacturer, raw.vendor, ''),
        createdAt: pick(raw.createdAt, raw.created_at, raw.created, raw.date_created, ''),
        metadata: raw.metadata || {},
        raw,
    };

    return {
        ...normalized,
        img: normalized.image,
        desc: normalized.short_description || normalized.description,
    };
};

export const useProductsStore = defineStore('products', () => {
    const products = ref([...fallbackProducts]);
    const featuredProducts = ref(fallbackProducts.slice(0, 8));
    const singleProduct = ref(null);
    const loading = ref(false);
    const error = ref('');
    const hasFetched = ref(false);
    
    // Store all categories separately so they don't disappear when filtering
    const allCategories = ref(['All']);

    const filters = ref({
        category: 'All',
        minPrice: 0,
        maxPrice: 2500,
        brands: [],
        onlyInStock: false
    });

    const sortBy = ref('featured');
    const searchQueries = ref('');
    const compareIds = ref([]);

    const productsWithAvgRating = computed(() => products.value.map((product) => {
        const reviews = Array.isArray(product.reviews) ? product.reviews : [];
        const totalRating = reviews.reduce((sum, review) => sum + toNumber(review.rating), 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : toNumber(product.rating);

        return {
            ...product,
            reviews,
            averageRating: Number(averageRating.toFixed(1)),
        };
    }));

    const sampleProducts = productsWithAvgRating;

    // Use allCategories instead of computing from products
    const categories = computed(() => {
        return allCategories.value;
    });

    const brands = computed(() => {
        const brandsStore = useBrandsStore();
        if (brandsStore.brands.length > 0) {
            return brandsStore.getActiveBrands().map(b => b.name);
        }
        return [...new Set(products.value.map((product) => product.brand).filter(Boolean))].sort();
    });

    // Brand filter options with counts for the sidebar
    const brandFilterOptions = computed(() => {
        const brandsStore = useBrandsStore();
        const brandCounts = {};
        
        // Count products per brand
        products.value.forEach(product => {
            if (product.brand) {
                brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
            }
        });
        
        // Get brands from API or fallback
        let brandList = [];
        if (brandsStore.brands.length > 0) {
            brandList = brandsStore.getActiveBrands().map(b => b.name);
        } else {
            brandList = [...new Set(products.value.map((product) => product.brand).filter(Boolean))];
        }
        
        // Return brands with counts, sorted alphabetically
        return brandList
            .sort()
            .map(name => ({
                name,
                count: brandCounts[name] || 0,
                active: filters.value.brands.includes(name)
            }));
    });

    const filteredProducts = computed(() => {
        let result = [...productsWithAvgRating.value];

        if (filters.value.category !== 'All') {
            result = result.filter((product) => product.category === filters.value.category);
        }

        if (searchQueries.value) {
            const query = searchQueries.value.toLowerCase();
            result = result.filter((product) =>
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query)
            );
        }

        result = result.filter((product) => product.price >= filters.value.minPrice && product.price <= filters.value.maxPrice);

        if (filters.value.brands.length > 0) {
            result = result.filter((product) => filters.value.brands.includes(product.brand));
        }

        if (filters.value.onlyInStock) {
            result = result.filter((product) => product.inStock);
        }

        switch (sortBy.value) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }

        return result;
    });

    const fetchProducts = async (params = {}, options = {}) => {
        if (loading.value || (hasFetched.value && !options.force)) return products.value;

        loading.value = true;
        error.value = '';

        try {
            const apiParams = {
                page: 1,
                page_size: 50,
                ...params
            };

            console.log("Fetching products with params:", apiParams);
            const response = await productAPI.list(apiParams);

            console.log("Products response:", response);

            let productData = response;
            if (!Array.isArray(response)) {
                productData = response.results || response.data || response.items || [];
                console.log("Extracted products from response:", productData);
            }

            if (!Array.isArray(productData)) {
                console.error("Product data is not an array:", productData);
                return products.value;
            }

            console.log("Normalizing products...");
            const normalizedProducts = productData
                .filter(item => item && typeof item === 'object')
                .map(normalizeProduct)
                .filter((product) => product.id && product.id !== '');

            console.log(`Normalized ${normalizedProducts.length} products`);

            if (normalizedProducts.length > 0) {
                products.value = normalizedProducts;
                featuredProducts.value = products.value
                    .filter((product) => product.is_active)
                    .slice(0, 8);
                
                // Update allCategories from ALL products (not filtered)
                const categoryValues = products.value
                    .map((product) => product.category)
                    .filter(Boolean);
                allCategories.value = ['All', ...new Set(categoryValues)];
                
                console.log("Products store updated successfully");
                console.log("Categories:", allCategories.value);
            } else {
                console.warn("No products returned from API, using fallback");
            }

            hasFetched.value = true;
            return products.value;
        } catch (err) {
            const errorMsg = err?.response?.data?.detail || err?.message || 'Unable to load Osimart products.';
            error.value = errorMsg;
            console.error("Error fetching products:", errorMsg);
            console.error("Full error:", err);
            return products.value;
        } finally {
            loading.value = false;
        }
    };

    const fetchProduct = async (id) => {
        loading.value = true;
        error.value = '';

        try {
            console.log("Fetching product detail for ID:", id);
            const response = await productAPI.detail(id);
            console.log("Product detail response:", response);

            if (response) {
                singleProduct.value = normalizeProduct(response);
                console.log("Normalized product:", singleProduct.value);

                if (singleProduct.value && !products.value.some((product) => String(product.id) === String(singleProduct.value.id))) {
                    products.value = [singleProduct.value, ...products.value];
                }
            } else {
                singleProduct.value = null;
            }

            return singleProduct.value;
        } catch (err) {
            error.value = err?.response?.data?.detail || err?.message || 'Unable to load Osimart product.';
            console.error("Error fetching product detail:", err);
            singleProduct.value = products.value.find((product) => String(product.id) === String(id)) || null;
            return singleProduct.value;
        } finally {
            loading.value = false;
        }
    };

    const fetchFeaturedProducts = async () => {
        if (!hasFetched.value) await fetchProducts();
        featuredProducts.value = products.value.filter((product) => product.is_active).slice(0, 8);
        return featuredProducts.value;
    };

    const resetFilters = () => {
        filters.value = { category: 'All', minPrice: 0, maxPrice: 2500, brands: [], onlyInStock: false };
        sortBy.value = 'featured';
    };

    const submitReview = (productId, userId, userName, rating, comment) => {
        const product = products.value.find((item) => String(item.id) === String(productId));
        if (product) {
            product.reviews.push({
                userId,
                userName,
                rating,
                comment,
                date: new Date().toISOString().slice(0, 10)
            });
        }
    };

    const toggleCompare = (productId) => {
        const index = compareIds.value.indexOf(productId);
        if (index > -1) {
            compareIds.value.splice(index, 1);
        } else if (compareIds.value.length < 3) {
            compareIds.value.push(productId);
        }
    };

    const compareProducts = computed(() => {
        return productsWithAvgRating.value.filter((product) => compareIds.value.includes(product.id));
    });

    return {
        products,
        featuredProducts,
        singleProduct,
        loading,
        error,
        sampleProducts,
        categories,
        allCategories,
        brands,
        brandFilterOptions,
        filters,
        sortBy,
        searchQueries,
        filteredProducts,
        resetFilters,
        submitReview,
        compareIds,
        toggleCompare,
        compareProducts,
        fetchProducts,
        fetchProduct,
        fetchFeaturedProducts,
    };
});