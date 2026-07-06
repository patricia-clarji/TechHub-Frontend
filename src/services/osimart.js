import { apiClient } from '@/services/apiClient';
import config from '@/config';

const OSIMART_STORE_ID = config.API.STORE_ID;

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const normalizeUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (isAbsoluteUrl(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `https://api.osimart.com/${String(value).replace(/^\/+/, '')}`;
};

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.objects)) return payload.objects;
    if (payload.results && typeof payload.results === 'object') {
      return Array.isArray(payload.results) ? payload.results : [payload.results];
    }
  }
  return [];
};

const extractObject = (payload) => {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) return payload;
  return null;
};

export const mediaAPI = {
  getImageUrl(value) {
    if (!value) return '';

    if (Array.isArray(value)) {
      return value.map(mediaAPI.getImageUrl).find(Boolean) || '';
    }

    if (typeof value === 'string') {
      return normalizeUrl(value);
    }

    if (typeof value === 'object') {
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

    return '';
  },
};

const buildParams = (params = {}) => ({
  ...(params || {}),
});

const fetchList = async (path, params = {}) => {
  const response = await apiClient.get(path, { params: buildParams(params) });
  if (!response.success) throw response.error;
  if (response.data === null) throw new Error(`Osimart returned no data for ${path}`);
  return extractList(response.data);
};

const fetchObject = async (path) => {
  const response = await apiClient.get(path);
  if (!response.success) throw response.error;
  if (response.data === null) return null;
  return extractObject(response.data);
};

export const bannerAPI = {
  async list(params = {}) {
    return fetchList('/banners/', params);
  },
};

export const productAPI = {
  async list(params = {}) {
    return fetchList('/products/', params);
  },
  async detail(id) {
    if (!id) return null;
    return fetchObject(`/products/${encodeURIComponent(id)}/`);
  },
  async detailBySlug(slug) {
    if (!slug) return null;
    const matches = await fetchList('/products/', { search: slug, page_size: 20 });
    return matches.find((product) => product.slugified_name === slug) || null;
  },
};

export const categoryAPI = {
  async list(params = {}) {
    return fetchList('/categories/', params);
  },
};

export const brandAPI = {
  async list(params = {}) {
    return fetchList('/brands/', params);
  },
};

export const getOsimartStoreId = () => OSIMART_STORE_ID;

export default apiClient;
