const ENV = import.meta.env.MODE || 'development';
const IS_DEV = import.meta.env.DEV === true;
const FEATURE_FLAGS = {
  useFallbackProducts: import.meta.env.VITE_USE_FALLBACK_PRODUCTS === 'true',
};

export const API = {
  OSIMART_BASE_URL: import.meta.env.VITE_OSIMART_BASE_URL || 'https://api.osimart.com/store/apis',
  STORE_ID: import.meta.env.VITE_OSIMART_STORE_ID?.trim() || '',
  TOKEN: import.meta.env.VITE_OSIMART_TOKEN?.trim() || '',
};

export const ENVIRONMENT = {
  ENV,
  IS_DEV,
  FEATURE_FLAGS,
};

export default {
  API,
  ENVIRONMENT,
};
