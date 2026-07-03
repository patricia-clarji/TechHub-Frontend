import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';
import { error as logError, debug as logDebug } from '@/utils/logger';

const ACCESS_KEY = 'osimart_access';
const REFRESH_KEY = 'osimart_refresh';
const AUTH_EVENT_KEY = 'techhub_auth_event';
const CACHE_PREFIXES = ['api_', 'cache', 'osimart'];

let piniaInstance = null;
let idleTimer = null;
let idleTimeoutMs = 15 * 60 * 1000; // 15 minutes default
let warningTimeoutMs = 60 * 1000; // 1 minute warning

export const AuthService = {
  init(pinia, options = {}) {
    piniaInstance = pinia;
    if (options.idleTimeoutMs) idleTimeoutMs = options.idleTimeoutMs;
    if (options.warningTimeoutMs) warningTimeoutMs = options.warningTimeoutMs;
    this._initStorageSync();
    this._initIdleHandlers();
  },

  _getUserStore() {
    try {
      return useUserStore();
    } catch (e) {
      logError('Unable to access user store:', e);
      return null;
    }
  },

  getAccessToken() {
    return sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY) || '';
  },

  setAccessToken(token, remember = false) {
    if (remember) localStorage.setItem(ACCESS_KEY, token);
    else sessionStorage.setItem(ACCESS_KEY, token);
    this._emitAuthEvent('login');
  },

  clearTokens() {
    try {
      sessionStorage.removeItem(ACCESS_KEY);
      sessionStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch (e) {
      logError('Error clearing tokens:', e);
    }
  },

  _clearCachedApiData() {
    try {
      ['localStorage', 'sessionStorage'].forEach((storageName) => {
        const storage = window[storageName];
        if (!storage || typeof storage !== 'object') return;
        Object.keys(storage).forEach((key) => {
          if (CACHE_PREFIXES.some((prefix) => key.toLowerCase().startsWith(prefix))) {
            storage.removeItem(key);
          }
        });
      });
    } catch (e) {
      logError('Error clearing cached API data:', e);
    }
  },

  isAuthenticated() {
    const token = this.getAccessToken();
    const userStore = this._getUserStore();
    return Boolean(token && userStore?.currentUser);
  },

  async logout() {
    const userStore = this._getUserStore();
    if (userStore && typeof userStore.logout === 'function') {
      try {
        userStore.logout();
      } catch (e) {
        logError('Error during store logout:', e);
      }
    }
    this.clearTokens();
    this._clearCachedApiData();
    this._emitAuthEvent('logout');
    try {
      const ui = useUIStore();
      if (ui) ui.navigateToLogin?.();
    } catch (_) {}
  },

  async refreshToken() {
    const refresh = sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
    if (!refresh) return false;
    try {
      const base = import.meta.env.VITE_OSIMART_BASE_URL || '';
      const url = base ? `${base.replace(/\/$/, '')}/auth/refresh/` : '/auth/refresh/';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.access) this.setAccessToken(data.access, false);
      if (data?.refresh) {
        sessionStorage.setItem(REFRESH_KEY, data.refresh);
      }
      return true;
    } catch (e) {
      logError('Refresh token call failed');
      return false;
    }
  },

  _emitAuthEvent(event) {
    try {
      localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify({ event, ts: Date.now() }));
    } catch (e) {
      // ignore
    }
  },

  _initStorageSync() {
    window.addEventListener('storage', (ev) => {
      if (ev.key !== AUTH_EVENT_KEY) return;
      try {
        const payload = JSON.parse(ev.newValue || '{}');
        if (payload.event === 'logout') {
          const userStore = this._getUserStore();
          userStore && userStore.currentUser && userStore.logout?.();
        }
        if (payload.event === 'login') {
          // noop: stores will pick up persisted values via their own watches
        }
      } catch (e) {
        // ignore
      }
    });
  },

  _initIdleHandlers() {
    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        // warn the user
        try {
          const shouldStay = window.confirm('Your session will expire in 1 minute due to inactivity. Stay signed in?');
          if (shouldStay) {
            // reset timer
            resetTimer();
          } else {
            await this.logout();
            window.location.reload();
          }
        } catch (e) {
          await this.logout();
          window.location.reload();
        }
      }, idleTimeoutMs - warningTimeoutMs);
    };

    ['click', 'keydown', 'mousemove', 'touchstart'].forEach((ev) =>
      window.addEventListener(ev, resetTimer)
    );

    resetTimer();
  },
};

export default AuthService;
