const ENV = import.meta.env.MODE || 'development';
const IS_DEV = import.meta.env.DEV === true;

export const API = {
  OSIMART_BASE_URL: import.meta.env.VITE_OSIMART_BASE_URL || 'https://api.osimart.com/store/apis',
  OSIMART_AUTH_URL: import.meta.env.VITE_OSIMART_AUTH_URL || 'https://api.osimart.com/auth',
  OSIMART_ADMIN_URL: import.meta.env.VITE_OSIMART_ADMIN_URL?.trim().replace(/\/+$/, '') || '',
  STORE_ID: import.meta.env.VITE_OSIMART_STORE_ID?.trim() || '',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '',
};

export const SITE = {
  URL: (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, ''),
  NAME: import.meta.env.VITE_SITE_NAME || 'TechHub',
  DEFAULT_OG_IMAGE: import.meta.env.VITE_DEFAULT_OG_IMAGE || '/og-image.svg',
};

export const ENVIRONMENT = {
  ENV,
  IS_DEV,
};

export const ADMIN = {
  // The frontend never treats this flag as authorization. Until Osimart exposes
  // a server-verified staff session, the admin workspace remains read-only.
  MODE: 'demo',
};

export default {
  API,
  SITE,
  ENVIRONMENT,
  ADMIN,
};
