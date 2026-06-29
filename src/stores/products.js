import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { mediaAPI } from '@/services/osimart';
import { fallbackProducts } from './fallbackProducts';

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
    return pick(raw.name, raw.title, raw.slug, raw.id, '');
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
    ];

    return [...new Set(values.map((image) => mediaAPI.getImageUrl(image)).filter(Boolean))];
};

const normalizeProduct = (raw = {}) => {
    const category = normalizeCategory(pick(raw.category, raw.category_name, raw.collection));
    const categoryId = pick(raw.category_id, raw.category?.id, raw.collection_id, raw.collection?.id, '');
    const categorySlug = pick(raw.category_slug, raw.category?.slug, raw.collection_slug, raw.collection?.slug, toSlug(category));
    const images = normalizeImages(raw);
    const reviews = normalizeReviews(raw);
    const stock = toNumber(pick(raw.stock, raw.quantity, raw.available_quantity, raw.inventory), 0);
    const isActive = pick(raw.is_active, raw.active, raw.enabled, true);
    const isInStock = pick(raw.inStock, raw.in_stock, raw.available, stock > 0);

    const normalized = {
        id: pick(raw.id, raw.pk, raw.uuid, raw.slug),
        name: pick(raw.name, raw.title, raw.product_name, 'Untitled Product'),
        slug: pick(raw.slug, toSlug(pick(raw.name, raw.title, raw.product_name, raw.id))),
        price: toNumber(pick(raw.price, raw.sale_price, raw.current_price, raw.unit_price), 0),
        oldPrice: toNumber(pick(raw.oldPrice, raw.old_price, raw.compare_at_price, raw.original_price), 0),
        description: pick(raw.description, raw.full_description, raw.desc, ''),
        short_description: pick(raw.short_description, raw.shortDescription, raw.summary, raw.desc, raw.description, ''),
        image: images[0] || '',
        images,
        category,
        category_id: categoryId,
        category_slug: categorySlug,
        badge: pick(raw.badge, raw.label, raw.tagline, ''),
        stock,
        rating: toNumber(pick(raw.rating, raw.average_rating, raw.avg_rating), 0),
        review_count: toNumber(pick(raw.review_count, raw.reviews_count, raw.rating_count, reviews.length), reviews.length),
        tags: toArray(pick(raw.tags, raw.keywords)),
        features: toArray(pick(raw.features, raw.highlights, raw.specifications_list)),
        variants: toArray(raw.variants).map((variant, index) => ({
            id: pick(variant.id, variant.pk, variant.sku, `variant-${index}`),
            name: pick(variant.name, variant.title, variant.sku, `Option ${index + 1}`),
            stock: toNumber(pick(variant.stock, variant.quantity, stock), stock),
            priceMod: toNumber(pick(variant.priceMod, variant.price_mod, variant.price_delta), 0),
            ...variant,
        })),
        colors: toArray(raw.colors),
        specifications: raw.specifications || raw.attributes || raw.metadata || {},
        reviews,
        is_active: Boolean(isActive),
        inStock: Boolean(isInStock),
        brand: pick(raw.brand, raw.brand_name, raw.manufacturer, ''),
        createdAt: pick(raw.createdAt, raw.created_at, raw.created, ''),
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

    const categories = computed(() => {
        const values = products.value
            .map((product) => product.category)
            .filter(Boolean);

        return ['All', ...new Set(values)];
    });

    const brands = computed(() => {
        return [...new Set(products.value.map((product) => product.brand).filter(Boolean))].sort();
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
            const response = await productAPI.list(params);
            const normalizedProducts = response.map(normalizeProduct).filter((product) => product.id);

            if (normalizedProducts.length > 0) {
                products.value = normalizedProducts;
                featuredProducts.value = products.value.filter((product) => product.is_active).slice(0, 8);
            }

            hasFetched.value = true;
            return products.value;
        } catch (err) {
            error.value = err?.response?.data?.detail || err?.message || 'Unable to load Osimart products.';
            return products.value;
        } finally {
            loading.value = false;
        }
    };

    const fetchProduct = async (id) => {
        loading.value = true;
        error.value = '';

        try {
            const response = await productAPI.detail(id);
            singleProduct.value = response ? normalizeProduct(response) : null;

            if (singleProduct.value && !products.value.some((product) => String(product.id) === String(singleProduct.value.id))) {
                products.value = [singleProduct.value, ...products.value];
            }

            return singleProduct.value;
        } catch (err) {
            error.value = err?.response?.data?.detail || err?.message || 'Unable to load Osimart product.';
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
        brands,
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