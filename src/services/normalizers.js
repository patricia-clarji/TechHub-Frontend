import { mediaAPI } from '@/services/osimart';
import { toArray, toNumber, toSlug, safeString } from '@/utils/helpers';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeCategory = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return pick(raw.name, raw.title, raw.slug, raw.category_name, raw.category?.name, raw.id, '');
};

const normalizeImages = (raw) => {
  const values = [
    ...toArray(raw.gallery).map((item) => item?.media || item),
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

export const normalizeProduct = (raw = {}) => {
  const categoryRecord = raw.categories?.[0]?.category || raw.category || null;
  const category = normalizeCategory(categoryRecord || raw.category_name);
  const categoryId = pick(categoryRecord?.id, raw.category_id, '');
  const categorySlug = pick(categoryRecord?.slugified_name, categoryRecord?.slug, toSlug(category));
  const images = normalizeImages(raw);
  const variants = toArray(raw.product_variants || raw.variants);
  const variantPrices = variants.map((variant) => toNumber(variant.discounted_price_range ?? variant.price, NaN)).filter(Number.isFinite);
  const variantComparePrices = variants.map((variant) => toNumber(variant.compare_at_price, NaN)).filter(Number.isFinite);
  const price = toNumber(raw.discounted_price_range ?? raw.price_range ?? raw.price, variantPrices[0] || 0);
  const comparePrice = toNumber(raw.price_range ?? raw.compare_at_price, variantComparePrices[0] || 0);
  const stock = toNumber(raw.remaining_stock ?? raw.stock, 0);
  const isActive = !raw.unlisted_at && !raw.archived_at;
  const isInStock = raw.status ? raw.status.toLowerCase() === 'in stock' : stock > 0;

  const id = pick(raw.id, raw.pk, raw.uuid, raw.slug, raw.product_id);
  const name = pick(raw.name, raw.title, raw.product_name, raw.productName, 'Untitled Product');

  return {
    id,
    name,
    slug: pick(raw.slugified_name, raw.slug, toSlug(name || id)),
    price,
    oldPrice: comparePrice > price ? comparePrice : 0,
    description: safeString(raw.description ?? raw.full_description ?? raw.desc ?? raw.long_description, ''),
    short_description: safeString(raw.short_description ?? raw.shortDescription ?? raw.summary ?? raw.desc ?? raw.description, ''),
    image: images[0] || '',
    images,
    category,
    category_id: categoryId,
    category_slug: categorySlug,
    badge: pick(raw.badge, raw.label, raw.tagline, raw.badge_text, ''),
    stock,
    rating: toNumber(raw.rating ?? raw.average_rating ?? raw.avg_rating, 0),
    review_count: toNumber(raw.review_count ?? raw.reviews_count ?? raw.rating_count, 0),
    tags: toArray(raw.tags ?? raw.keywords ?? raw.tag_list),
    features: toArray(raw.features ?? raw.highlights ?? raw.specifications_list ?? raw.benefits),
    variants: variants.map((variant, index) => ({
      ...variant,
      id: pick(variant.id, variant.pk, variant.sku, `variant-${index}`),
      name: pick(
        variant.name,
        variant.title,
        toArray(variant.values).map((value) => value?.name || value?.value?.name).filter(Boolean).join(' / '),
        variant.sku,
        `Option ${index + 1}`
      ),
      stock: toNumber(variant.remaining_stock ?? variant.stock, stock),
      price: toNumber(variant.discounted_price_range ?? variant.price, price),
      priceMod: toNumber(variant.discounted_price_range ?? variant.price, price) - price,
    })),
    colors: toArray(raw.colors),
    specifications: raw.specifications || raw.attributes || raw.metadata || raw.specs || {},
    reviews: toArray(raw.reviews ?? raw.ratings ?? raw.feedback).map((review, index) => ({
      userId: pick(review.userId, review.user_id, review.user, `review-${index}`),
      userName: pick(review.userName, review.user_name, review.name, 'Customer'),
      rating: toNumber(review.rating ?? review.stars ?? review.score, 0),
      comment: pick(review.comment, review.review, review.text, ''),
      date: pick(review.date, review.created_at, review.updated_at, ''),
    })),
    is_active: Boolean(isActive),
    inStock: Boolean(isInStock),
    brand: pick(raw.brand?.name, raw.brand_name, typeof raw.brand === 'string' ? raw.brand : '', ''),
    brand_id: pick(raw.brand?.id, raw.brand_id, ''),
    createdAt: pick(raw.published_at, raw.created_at, ''),
    metadata: raw.metadata || {},
    raw,
    img: images[0] || '',
    desc: safeString(raw.short_description ?? raw.shortDescription ?? raw.summary ?? raw.desc ?? raw.description, ''),
  };
};
