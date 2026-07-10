let sessionToken = '';
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
      this.clear();
      return '';
    }
    return sessionToken;
  },
  getUser() {
    return sessionUser;
  },
  set(token, user) {
    sessionToken = token;
    sessionUser = Object.freeze({ ...user });
  },
  updateUser(user) {
    if (!sessionUser) return null;
    sessionUser = Object.freeze({ ...sessionUser, ...user });
    return sessionUser;
  },
  clear() {
    sessionToken = '';
    sessionUser = null;
  },
};
