let sessionToken = '';
let sessionRefreshToken = '';
let sessionUser = null;
let sessionGeneration = 0;

const refreshStorageKey = 'techhub_auth_refresh_v1';
const userStorageKey = 'techhub_auth_user_v1';

const safeParse = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const storage = () => (typeof sessionStorage === 'undefined' ? null : sessionStorage);

const readStored = (key, fallback = '') => {
  const target = storage();
  if (!target) return fallback;
  const parsed = safeParse(target.getItem(key));
  return parsed ?? fallback;
};

const writeStored = (key, value) => {
  const target = storage();
  if (!target) return;
  try {
    target.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private modes; keep memory auth working.
  }
};

const removeStored = (key) => {
  const target = storage();
  if (!target) return;
  try { target.removeItem(key); } catch { /* ignore unavailable storage */ }
};

const persistRecoverableSession = (refreshToken, user) => {
  if (refreshToken) writeStored(refreshStorageKey, refreshToken);
  if (user) writeStored(userStorageKey, {
    id: user.id || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    name: user.name || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
  });
};

const clearRecoverableSession = () => {
  removeStored(refreshStorageKey);
  removeStored(userStorageKey);
};

const tokenExpiry = (token) => {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const payload = safeParse(atob(padded));
    return Number(payload?.exp || 0) * 1000;
  } catch {
    return 0;
  }
};

export const authSession = {
  getGeneration() {
    return sessionGeneration;
  },
  getToken() {
    const expiresAt = tokenExpiry(sessionToken);
    if (expiresAt && expiresAt <= Date.now()) {
      sessionToken = '';
      return '';
    }
    return sessionToken;
  },
  getRefreshToken() {
    return sessionRefreshToken || this.getPersistedRefreshToken();
  },
  getPersistedRefreshToken() {
    return readStored(refreshStorageKey, '');
  },
  getPersistedUser() {
    return readStored(userStorageKey, null);
  },
  hasRecoverableSession() {
    return Boolean(this.getPersistedRefreshToken());
  },
  getUser() {
    return sessionUser;
  },
  set(token, user, refreshToken = '') {
    sessionToken = token;
    sessionRefreshToken = refreshToken || sessionRefreshToken;
    sessionUser = Object.freeze({ ...user });
    if (refreshToken) persistRecoverableSession(refreshToken, sessionUser);
  },
  updateAccessToken(token, refreshToken = '') {
    sessionToken = token;
    if (refreshToken) sessionRefreshToken = refreshToken;
    if (refreshToken || sessionUser) persistRecoverableSession(refreshToken, sessionUser);
  },
  updateUser(user) {
    sessionUser = user ? Object.freeze({ ...user }) : null;
    if (sessionUser) persistRecoverableSession(sessionRefreshToken || this.getPersistedRefreshToken(), sessionUser);
  },
  clearMemory() {
    sessionToken = '';
    sessionRefreshToken = '';
    sessionUser = null;
  },
  clear() {
    sessionGeneration += 1;
    this.clearMemory();
    clearRecoverableSession();
  },
};
