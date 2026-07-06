export const readJson = (storage, key, fallback) => {
  try {
    const parsed = JSON.parse(storage.getItem(key) || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in privacy modes; keep in-memory state working.
  }
};
