import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { productAPI } from '@/services/osimart';
import logger from '@/utils/logger';
import { normalizeProduct } from '@/services/normalizers';
import { useBrandsStore } from '@/stores/catalog/brands';
import { useOsimartCategoriesStore } from '@/stores/catalog/osimartCategories';

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

export const useProductsStore = defineStore('products', () => {
    const products = ref([]);
    const featuredProducts = ref([]);
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

    const brandFilterOptions = computed(() => {
        const brandsStore = useBrandsStore();
        const brandCounts = {};

        products.value.forEach(product => {
            if (product.brand) {
                brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
            }
        });

        let brandList = [];
        if (brandsStore.brands.length > 0) {
            brandList = brandsStore.getActiveBrands().map(b => b.name);
        } else {
            brandList = [...new Set(products.value.map((product) => product.brand).filter(Boolean))];
        }

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
        const matchesReference = (value, candidates) => {
            const normalized = String(value || '').trim().toLowerCase();
            return candidates.some((candidate) => String(candidate || '').trim().toLowerCase() === normalized);
        };

        if (filters.value.category !== 'All') {
            result = result.filter((product) => matchesReference(filters.value.category, [
                product.category,
                product.category_id,
                product.category_slug,
            ]));
        }

        if (searchQueries.value) {
            const query = searchQueries.value.toLowerCase();
            result = result.filter((product) =>
                String(product.name).toLowerCase().includes(query) ||
                String(product.category).toLowerCase().includes(query) ||
                String(product.brand).toLowerCase().includes(query)
            );
        }

        result = result.filter((product) => product.price >= filters.value.minPrice && product.price <= filters.value.maxPrice);

        if (filters.value.brands.length > 0) {
            result = result.filter((product) => filters.value.brands.some((brand) => matchesReference(brand, [
                product.brand,
                product.brand_id,
                product.raw?.brand?.slugified_name,
            ])));
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

    // Function to update categories from products
    const updateCategoriesFromProducts = () => {
        const categoryValues = products.value
            .map((product) => product.category)
            .filter(Boolean);
        const uniqueCategories = ['All', ...new Set(categoryValues)];
        allCategories.value = uniqueCategories;
        logger.debug('Updated categories:', allCategories.value);
        return allCategories.value;
    };

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

            logger.debug('Fetching products with params:', apiParams);
            const response = await productAPI.list(apiParams);
            logger.debug('Products response:', response);

            const normalizedProducts = response
                .filter(item => item && typeof item === 'object')
                .map(normalizeProduct)
                .filter((product) => product.id && product.id !== '');

            logger.debug(`Normalized ${normalizedProducts.length} products`);

            if (normalizedProducts.length > 0) {
                products.value = normalizedProducts;
                featuredProducts.value = products.value
                    .filter((product) => product.is_active)
                    .slice(0, 8);

                updateCategoriesFromProducts();
                logger.debug('Products store updated successfully with API data');
            } else {
                products.value = [];
                featuredProducts.value = [];
                updateCategoriesFromProducts();
            }

            const categoriesStore = useOsimartCategoriesStore();
            if (categoriesStore.categories.length > 0) {
                const categoryNames = categoriesStore.categories
                    .filter(cat => cat.is_active)
                    .map(cat => cat.name);
                if (categoryNames.length > 0) {
                    allCategories.value = ['All', ...categoryNames];
                    logger.debug('Categories updated from API store:', allCategories.value);
                }
            }

            hasFetched.value = true;
            return products.value;
        } catch (err) {
            const errorMsg = err?.response?.data?.detail || err?.message || 'Unable to load Osimart products.';
            error.value = errorMsg;
            logger.error('Error fetching products:', errorMsg);
            logger.error('Full error:', err);
            products.value = [];
            featuredProducts.value = [];
            return products.value;
        } finally {
            loading.value = false;
        }
    };

    const fetchProduct = async (id) => {
        loading.value = true;
        error.value = '';

        try {
            logger.debug('Fetching product detail for ID:', id);
            const cached = products.value.find((product) =>
                [product.id, product.slug].some((value) => String(value) === String(id))
            );
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
            const response = isUuid
                ? await productAPI.detail(id)
                : await productAPI.detailBySlug(id);
            logger.debug('Product detail response:', response);

            if (response) {
                singleProduct.value = normalizeProduct(response);
                logger.debug('Normalized product:', singleProduct.value);

                if (singleProduct.value && !products.value.some((product) => String(product.id) === String(singleProduct.value.id))) {
                    products.value = [singleProduct.value, ...products.value];
                }
            } else {
                singleProduct.value = cached || null;
            }

            return singleProduct.value;
        } catch (err) {
            error.value = err?.response?.data?.detail || err?.message || 'Unable to load Osimart product.';
            logger.error('Error fetching product detail:', err);
            singleProduct.value = products.value.find((product) =>
                [product.id, product.slug].some((value) => String(value) === String(id))
            ) || null;
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
        hasFetched,
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
        compareIds,
        toggleCompare,
        compareProducts,
        fetchProducts,
        fetchProduct,
        fetchFeaturedProducts,
        updateCategoriesFromProducts,
    };
});
