let sessionToken = '';
let sessionRefreshToken = '';
let sessionUser = null;

const safeParse = (value) => {
  try { return JSON.parse(value); } catch { return null; }
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
  getToken() {
    const expiresAt = tokenExpiry(sessionToken);
    if (expiresAt && expiresAt <= Date.now()) {
      sessionToken = '';
      return '';
    }
    return sessionToken;
  },
  getRefreshToken() {
    return sessionRefreshToken;
  },
  getUser() {
    return sessionUser;
  },
  set(token, user, refreshToken = '') {
    sessionToken = token;
    sessionRefreshToken = refreshToken || sessionRefreshToken;
    sessionUser = Object.freeze({ ...user });
  },
  updateAccessToken(token, refreshToken = '') {
    sessionToken = token;
    if (refreshToken) sessionRefreshToken = refreshToken;
  },
  clear() {
    sessionToken = '';
    sessionRefreshToken = '';
    sessionUser = null;
  },
};
