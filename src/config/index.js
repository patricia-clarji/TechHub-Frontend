const ENV = import.meta.env.MODE || 'development';
const IS_DEV = import.meta.env.DEV === true;

const cleanEnvUrl = (value, fallback = '') => {
  const raw = String(value || '').trim();
  const duplicatedAssignment = raw.match(/^[A-Z0-9_]+=(https?:\/\/.+)$/i);
  return (duplicatedAssignment ? duplicatedAssignment[1] : raw || fallback).replace(/\/+$/, '');
};

export const API = {
  OSIMART_BASE_URL: cleanEnvUrl(import.meta.env.VITE_OSIMART_BASE_URL, 'https://api.osimart.com/store/apis'),
  OSIMART_AUTH_URL: cleanEnvUrl(import.meta.env.VITE_OSIMART_AUTH_URL, 'https://api.osimart.com/auth'),
  OSIMART_ADMIN_URL: cleanEnvUrl(import.meta.env.VITE_OSIMART_ADMIN_URL),
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
  // Frontend flags are never authorization. Admin access stays blocked until a
  // backend staff session and role check are confirmed.
  MODE: 'demo',
  STAFF_AUTH_CONFIGURED: false,
};

export default {
  API,
  SITE,
  ENVIRONMENT,
  ADMIN,
};
