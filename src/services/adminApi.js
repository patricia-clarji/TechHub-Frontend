import axios from 'axios';
import config from '@/config';
import { apiClient } from '@/services/apiClient';
import { adminResources, getAdminResource } from '@/services/adminResources';
import { normalizeDrfObject, normalizeDrfResponse } from '@/services/drf';

export class UnsupportedAdminOperationError extends Error {
  constructor(operation) {
    super(`${operation} requires a confirmed backend write API. Existing DRF GET endpoints remain read-only.`);
    this.name = 'UnsupportedAdminOperationError';
  }
}

const hasStaffApi = Boolean(config.API.OSIMART_ADMIN_URL);

const getCookie = (name) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

const createAdminClient = () => axios.create({
  baseURL: config.API.OSIMART_ADMIN_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const ensureStaffWriteApi = (operation) => {
  if (!hasStaffApi) throw new UnsupportedAdminOperationError(operation);
};

const staffWriteRequest = async (operation, axiosConfig) => {
  ensureStaffWriteApi(operation);
  const csrfToken = getCookie('csrftoken');
  const response = await createAdminClient().request({
    ...axiosConfig,
    headers: {
      ...(axiosConfig.headers || {}),
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    },
  });
  return response.data;
};

const detailEndpoint = (resource, id) => `${resource.endpoint}${encodeURIComponent(id)}/`;

export const listAdminResource = async (resourceKey, params = {}) => {
  const resource = getAdminResource(resourceKey);
  if (!resource?.supportsList) throw new UnsupportedAdminOperationError(`${resourceKey} list access`);

  const response = await apiClient.get(resource.endpoint, { params });
  if (!response.success) throw response.error;
  return normalizeDrfResponse(response.data);
};

export const getAdminResourceDetail = async (resourceKey, id) => {
  const resource = getAdminResource(resourceKey);
  if (!resource?.supportsDetail) throw new UnsupportedAdminOperationError(`${resourceKey} detail access`);

  const response = await apiClient.get(detailEndpoint(resource, id));
  if (!response.success) throw response.error;
  return normalizeDrfObject(response.data);
};

const writeEndpoint = (resourceKey, id = '') => {
  const resource = getAdminResource(resourceKey);
  if (!resource) throw new UnsupportedAdminOperationError(`${resourceKey} write access`);
  return id ? detailEndpoint(resource, id) : resource.endpoint;
};

const create = (resourceKey, data) => staffWriteRequest(`${resourceKey} creation`, {
  method: 'post',
  url: writeEndpoint(resourceKey),
  data,
});

const update = (resourceKey, id, data) => staffWriteRequest(`${resourceKey} updates`, {
  method: 'patch',
  url: writeEndpoint(resourceKey, id),
  data,
});

const remove = (resourceKey, id) => staffWriteRequest(`${resourceKey} deletion`, {
  method: 'delete',
  url: writeEndpoint(resourceKey, id),
});

const capabilities = Object.freeze(Object.fromEntries(
  Object.keys(adminResources).map((key) => [key, { read: true, detail: Boolean(adminResources[key].supportsDetail), write: false }])
));

export const adminApi = {
  mode: hasStaffApi ? 'staff-api-configured-read-only-writes' : 'drf-read-only',
  resources: adminResources,
  capabilities,
  listResource: listAdminResource,
  getResourceDetail: getAdminResourceDetail,
  listProducts: (params = {}) => listAdminResource('products', { page_size: 100, ...params }).then((result) => result.items),
  getProduct: (id) => getAdminResourceDetail('products', id),
  listCategories: (params = {}) => listAdminResource('categories', { page_size: 100, ...params }).then((result) => result.items),
  listBrands: (params = {}) => listAdminResource('brands', { page_size: 100, ...params }).then((result) => result.items),
  listBanners: (params = {}) => listAdminResource('banners', params).then((result) => result.items),
  listOrders: (params = {}) => listAdminResource('orders', params).then((result) => result.items),
  listCustomers: (params = {}) => listAdminResource('customers', params).then((result) => result.items),
  listOrderStatuses: async () => {
    throw new UnsupportedAdminOperationError('Order status access is not present in the current DRF route list');
  },
  listShippingCountries: (params = {}) => listAdminResource('shipping-countries', params).then((result) => result.items),
  listPromotions: (params = {}) => listAdminResource('promotions', params).then((result) => result.items),
  listMedia: (params = {}) => listAdminResource('banners', params).then((result) => result.items),
  listMarkets: (params = {}) => listAdminResource('stores', params).then((result) => result.items),
  listOnlineStore: (params = {}) => listAdminResource('policies', params).then((result) => result.items),
  listReviews: async () => {
    throw new UnsupportedAdminOperationError('Reviews access is not present in the current DRF route list');
  },
  createProduct: (data) => create('products', data),
  updateProduct: (id, data) => update('products', id, data),
  deleteProduct: (id) => remove('products', id),
  createCategory: (data) => create('categories', data),
  updateCategory: (id, data) => update('categories', id, data),
  deleteCategory: (id) => remove('categories', id),
  createBrand: (data) => create('brands', data),
  updateBrand: (id, data) => update('brands', id, data),
  deleteBrand: (id) => remove('brands', id),
  createBanner: (data) => create('banners', data),
  updateBanner: (id, data) => update('banners', id, data),
  deleteBanner: (id) => remove('banners', id),
  updateOrder: (id, data) => update('orders', id, data),
  deleteOrder: (id) => remove('orders', id),
  createOrderStatus: () => { throw new UnsupportedAdminOperationError('Order status creation'); },
  updateOrderStatus: () => { throw new UnsupportedAdminOperationError('Order status updates'); },
  deleteOrderStatus: () => { throw new UnsupportedAdminOperationError('Order status deletion'); },
  createShippingCountry: (data) => create('shipping-countries', data),
  updateShippingCountry: (id, data) => update('shipping-countries', id, data),
  deleteShippingCountry: (id) => remove('shipping-countries', id),
  createPromotion: (data) => create('promotions', data),
  updatePromotion: (id, data) => update('promotions', id, data),
  deletePromotion: (id) => remove('promotions', id),
  uploadMedia: (formData) => staffWriteRequest('Media upload', {
    method: 'post',
    url: writeEndpoint('banners'),
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMedia: (id, data) => update('banners', id, data),
  deleteMedia: (id) => remove('banners', id),
  createMarket: (data) => create('stores', data),
  updateMarket: (id, data) => update('stores', id, data),
  deleteMarket: (id) => remove('stores', id),
  updateOnlineStore: (id, data) => update('policies', id, data),
  updateInventory: (id, data) => update('products', id, data),
  updateReview: () => { throw new UnsupportedAdminOperationError('Review updates'); },
  deleteReview: () => { throw new UnsupportedAdminOperationError('Review deletion'); },
};
