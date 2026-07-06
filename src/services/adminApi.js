import { productAPI, categoryAPI, brandAPI, bannerAPI } from '@/services/osimart';

export class UnsupportedAdminOperationError extends Error {
  constructor(operation) {
    super(`${operation} is unavailable in read-only demo mode. Connect a server-verified Osimart staff API to enable it.`);
    this.name = 'UnsupportedAdminOperationError';
  }
}

const unsupported = (operation) => async () => {
  throw new UnsupportedAdminOperationError(operation);
};

export const adminApi = {
  mode: 'demo',
  capabilities: Object.freeze({
    products: { read: true, write: false },
    categories: { read: true, write: false },
    brands: { read: true, write: false },
    banners: { read: true, write: false },
    orders: { read: false, write: false },
    customers: { read: false, write: false },
    promotions: { read: false, write: false },
    reviews: { read: false, write: false },
    inventory: { read: true, write: false },
  }),
  listProducts: (params = {}) => productAPI.list({ page_size: 100, ...params }),
  getProduct: productAPI.detail,
  listCategories: (params = {}) => categoryAPI.list({ page_size: 100, ...params }),
  listBrands: (params = {}) => brandAPI.list({ page_size: 100, ...params }),
  listBanners: bannerAPI.list,
  listOrders: unsupported('Order access'),
  listCustomers: unsupported('Customer access'),
  listPromotions: unsupported('Promotion access'),
  listReviews: unsupported('Review access'),
  createProduct: unsupported('Product creation'),
  updateProduct: unsupported('Product updates'),
  deleteProduct: unsupported('Product deletion'),
  createCategory: unsupported('Category creation'),
  updateCategory: unsupported('Category updates'),
  deleteCategory: unsupported('Category deletion'),
  createBrand: unsupported('Brand creation'),
  updateBrand: unsupported('Brand updates'),
  deleteBrand: unsupported('Brand deletion'),
  updateOrder: unsupported('Order updates'),
  createBanner: unsupported('Banner creation'),
  updateBanner: unsupported('Banner updates'),
  deleteBanner: unsupported('Banner deletion'),
};
