import { productAPI } from '@/services/osimart';
import { normalizeProduct } from '@/services/normalizers';
import { handleApiError } from '@/services/errorHandler';

const extractArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export const loadProducts = async (params = {}) => {
  try {
    const response = await productAPI.list({ page: 1, page_size: 50, ...params });
    const rawProducts = extractArray(response);
    return rawProducts
      .filter((product) => product && typeof product === 'object')
      .map(normalizeProduct)
      .filter((product) => product?.id);
  } catch (error) {
    throw handleApiError(error, { context: 'loadProducts' });
  }
};

export const loadProduct = async (id) => {
  try {
    const response = await productAPI.detail(id);
    return response && typeof response === 'object' ? normalizeProduct(response) : null;
  } catch (error) {
    throw handleApiError(error, { context: 'loadProduct' });
  }
};
