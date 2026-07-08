import axios from 'axios';
import config from '@/config';
import { authSession } from './authSession';
import { readJson, writeJson } from '@/utils/storage';
import {
  normalizeLebanonMobileNumber,
  validateLebanonMobileNumber,
  validatePassword,
} from './authValidation';

const client = axios.create({
  baseURL: config.API.OSIMART_AUTH_URL,
  timeout: 12000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

const messageFrom = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors[0];
  if (Array.isArray(data?.errors)) return data.errors[0];
  const firstField = data && Object.entries(data).find(([, value]) => Array.isArray(value) && typeof value[0] === 'string');
  if (firstField) return `${firstField[0]}: ${firstField[1][0]}`;
  const first = data && Object.values(data).flat().find((value) => typeof value === 'string');
  return first || fallback;
};

const extractToken = (data) => data?.access || data?.access_token || data?.token || data?.key || data?.tokens?.access || data?.data?.access || data?.data?.token || '';
const extractUser = (data, email = '') => {
  const source = data?.user || data?.customer || data?.data?.user || data?.data || data || {};
  return {
    id: source.id || source.pk || '',
    email: source.email || email,
    firstName: source.first_name || '',
    lastName: source.last_name || '',
    name: [source.first_name, source.last_name].filter(Boolean).join(' ') || source.name || email.split('@')[0],
    phone: source.mobile_number || '',
    avatar: source.profile_pic_path || '',
  };
};

const deviceStorageKey = 'techhub_auth_device_id';

const createDeviceId = () => {
  const cryptoApi = globalThis.crypto;
  const uuid = cryptoApi?.randomUUID?.();
  if (uuid) return uuid;
  const bytes = new Uint8Array(16);
  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getDeviceId = () => {
  if (typeof localStorage === 'undefined') return createDeviceId();
  const stored = readJson(localStorage, deviceStorageKey, '');
  if (stored) return stored;
  const deviceId = createDeviceId();
  writeJson(localStorage, deviceStorageKey, deviceId);
  return deviceId;
};

const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'TechHub web';
  const ua = navigator.userAgent || '';
  const browser =
    ua.includes('Edg/') ? 'Edge' :
      ua.includes('Chrome/') ? 'Chrome' :
        ua.includes('Firefox/') ? 'Firefox' :
          ua.includes('Safari/') ? 'Safari' :
            'Browser';
  const os =
    navigator.userAgentData?.platform ||
    (ua.includes('Windows') ? 'Windows' :
      ua.includes('Mac OS') ? 'macOS' :
        ua.includes('Android') ? 'Android' :
          /iPhone|iPad|iPod/.test(ua) ? 'iOS' :
            navigator.platform || 'unknown OS');
  return `TechHub web (${browser} on ${os})`;
};

const loginErrorMessage = (error) => {
  const status = error?.response?.status;
  const fallback = status === 400 || status === 401
    ? 'Invalid email or password.'
    : status === 403
      ? 'This account is not allowed to sign in.'
      : status >= 500
        ? 'The Osimart server could not complete sign in right now.'
        : error?.code === 'ERR_NETWORK' || !error?.response
          ? 'Network error. Check your connection and try again.'
          : error.message || 'Unable to sign in.';
  return messageFrom(error, fallback);
};

const ensureStoreId = () => {
  if (!config.API.STORE_ID) {
    throw new Error('Store configuration is missing. Set VITE_OSIMART_STORE_ID before using authentication.');
  }
};

const ensureDeviceFields = (deviceId, deviceName) => {
  if (!deviceId || !deviceName) {
    throw new Error('Unable to prepare login device information. Please refresh and try again.');
  }
};

const verificationMessage = 'Account created. Please verify your account before signing in.';

export const authService = {
  async login(email, password) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || password === '' || typeof password === 'undefined' || password === null) {
      throw new Error('Email and password are required.');
    }
    ensureStoreId();
    const deviceName = getDeviceName();
    const deviceId = getDeviceId();
    ensureDeviceFields(deviceId, deviceName);

    const payload = {
      email: normalizedEmail,
      password,
      device_name: deviceName,
      device_id: deviceId,
      store_id: config.API.STORE_ID,
    };

    try {
      const response = await client.post('/login/', {
        login_as: 'customer',
        ...payload,
      });
      const { data } = response;
      const token = extractToken(data);
      if (!token) throw new Error('Osimart did not return a session token.');
      const user = extractUser(data, normalizedEmail);
      authSession.set(token, user);
      return user;
    } catch (error) {
      throw new Error(loginErrorMessage(error));
    }
  },

  async register({ firstName, lastName, email, password, phone }) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedFirstName = firstName?.trim();
    const normalizedLastName = lastName?.trim();
    const normalizedPhone = normalizeLebanonMobileNumber(phone);
    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !password || !phone?.trim()) {
      throw new Error('First name, last name, email, phone, and password are required.');
    }
    const phoneError = validateLebanonMobileNumber(phone);
    if (phoneError) throw new Error(phoneError);
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
    ensureStoreId();

    try {
      const { data } = await client.post('/register/', {
        register_as: 'customer',
        store_id: config.API.STORE_ID,
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: normalizedEmail,
        password: password.trim(),
        mobile_number: normalizedPhone,
      });
      const token = extractToken(data);
      if (token) {
        const user = extractUser(data, normalizedEmail);
        authSession.set(token, user);
        return { user, requiresLogin: false };
      }

      return {
        user: extractUser(data, normalizedEmail),
        requiresLogin: true,
        verificationRequired: true,
        loginError: verificationMessage,
        message: verificationMessage,
        email: normalizedEmail,
      };
    } catch (error) {
      const status = error?.response?.status;
      const fallback = status === 400 || status === 409
        ? 'Unable to create an account with those details. Check the form or use password recovery.'
        : status === 403
          ? 'Registration is not allowed for this store.'
          : status >= 500
            ? 'The Osimart server could not create the account right now.'
            : error?.code === 'ERR_NETWORK' || !error?.response
              ? 'Network error. Check your connection and try again.'
              : error.message || 'Unable to create your account right now. Please try again later.';
      throw new Error(messageFrom(error, fallback));
    }
  },

  async loginWithGoogle(credential) {
    if (!credential) throw new Error('Google did not return a valid credential.');
    ensureStoreId();
    try {
      const { data } = await client.post('/login/google/', {
        login_as: 'customer',
        store_id: config.API.STORE_ID,
        credential,
        id_token: credential,
      }, {
        headers: { Authorization: `Bearer ${credential}` },
      });
      const token = extractToken(data);
      if (!token) throw new Error('Osimart did not return a customer session.');
      const user = extractUser(data);
      authSession.set(token, user);
      return user;
    } catch (error) {
      throw new Error(messageFrom(error, error.message || 'Google sign-in could not be completed.'));
    }
  },

  async forgotPassword(email) {
    ensureStoreId();
    try {
      await client.post('/forgot-password/', {
        email: email.trim().toLowerCase(),
        reset_as: 'customer',
        store_id: config.API.STORE_ID,
      });
    } catch (error) {
      // Do not expose whether an email is registered. Treat validation responses
      // as accepted and always show the same message to prevent enumeration.
      if ([400, 404].includes(error?.response?.status)) return;
      throw new Error('Unable to request a password reset right now. Please try again later.');
    }
  },

  async resendVerification(email) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Enter your email before requesting a verification code.');
    ensureStoreId();
    try {
      await client.post('/regen/', {
        email: normalizedEmail,
        verify_as: 'customer',
        store_id: config.API.STORE_ID,
      });
    } catch (error) {
      throw new Error(messageFrom(error, 'Unable to resend verification right now. Please try again later.'));
    }
  },

  logout() {
    authSession.clear();
  },
};
