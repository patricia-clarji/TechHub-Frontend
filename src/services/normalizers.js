import { mediaAPI } from '@/services/osimart';
import { toArray, firstDefined, toNumber, toSlug, safeString } from '@/utils/helpers';

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeCategory = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return pick(raw.name, raw.title, raw.slug, raw.category_name, raw.category?.name, raw.id, '');
};

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

export const normalizeProduct = (raw = {}) => {
  const category = normalizeCategory(raw.category || raw.category_name || raw.collection || raw.category_data);
  const categoryId = pick(raw.category_id, raw.category?.id, raw.collection_id, raw.collection?.id, '');
  const categorySlug = pick(raw.category_slug, raw.category?.slug, raw.collection_slug, raw.collection?.slug, toSlug(category));
  const images = normalizeImages(raw);
  const stock = toNumber(raw.stock ?? raw.quantity ?? raw.available_quantity ?? raw.inventory ?? raw.stock_quantity, 0);
  const isActive = raw.is_active ?? raw.active ?? raw.enabled ?? true;
  const isInStock = raw.inStock ?? raw.in_stock ?? raw.available ?? stock > 0;

  const id = pick(raw.id, raw.pk, raw.uuid, raw.slug, raw.product_id);
  const name = pick(raw.name, raw.title, raw.product_name, raw.productName, 'Untitled Product');

  return {
    id,
    name,
    slug: pick(raw.slug, toSlug(name || id)),
    price: toNumber(raw.price ?? raw.sale_price ?? raw.current_price ?? raw.unit_price ?? raw.regular_price, 0),
    oldPrice: toNumber(raw.oldPrice ?? raw.old_price ?? raw.compare_at_price ?? raw.original_price ?? raw.regular_price, 0),
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
    variants: toArray(raw.variants).map((variant, index) => ({
      id: pick(variant.id, variant.pk, variant.sku, `variant-${index}`),
      name: pick(variant.name, variant.title, variant.sku, `Option ${index + 1}`),
      stock: toNumber(variant.stock ?? variant.quantity ?? stock, stock),
      priceMod: toNumber(variant.priceMod ?? variant.price_mod ?? variant.price_delta, 0),
      ...variant,
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
    brand: pick(raw.brand, raw.brand_name, raw.manufacturer, raw.vendor, ''),
    createdAt: pick(raw.createdAt, raw.created_at, raw.created, raw.date_created, ''),
    metadata: raw.metadata || {},
    raw,
    img: images[0] || '',
    desc: safeString(raw.short_description ?? raw.shortDescription ?? raw.summary ?? raw.desc ?? raw.description, ''),
  };
};
