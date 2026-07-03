export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

export const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const toSlug = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const safeString = (value, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};
