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

export class AuthError extends Error {
  constructor(message, { code = 'AUTH_ERROR', status = null, raw = null } = {}) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
    this.raw = raw;
  }
}

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

const normalizeAuthResponse = (data, email = '') => ({
  token: extractToken(data),
  user: extractUser(data, email),
  raw: data,
});

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

const getDeviceInfo = () => {
  const deviceName = getDeviceName();
  const deviceId = getDeviceId();
  if (!deviceId || !deviceName) {
    throw new AuthError('Unable to prepare login device information. Please refresh and try again.', { code: 'DEVICE_INFO_MISSING' });
  }
  return { device_name: deviceName, device_id: deviceId };
};

const errorCodeFromMessage = (message, status) => {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('not verified')) return 'ACCOUNT_UNVERIFIED';
  if (normalized.includes('invalid user') || normalized.includes('invalid email') || normalized.includes('invalid password')) return 'INVALID_CREDENTIALS';
  if (normalized.includes('invalid store')) return 'INVALID_STORE';
  if (normalized.includes('expired')) return 'EXPIRED_VERIFICATION_CODE';
  if (normalized.includes('invalid') && normalized.includes('code')) return 'INVALID_VERIFICATION_CODE';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER_ERROR';
  if (!status) return 'NETWORK_ERROR';
  return 'AUTH_ERROR';
};

const mapAuthError = (error, fallback) => {
  if (error instanceof AuthError) return error;
  const status = error?.response?.status;
  const message = messageFrom(error, fallback);
  return new AuthError(message, {
    code: errorCodeFromMessage(message, status),
    status,
    raw: error,
  });
};

const ensureStoreId = () => {
  if (!config.API.STORE_ID) {
    throw new AuthError('Store configuration is missing. Please contact support.', { code: 'STORE_CONFIG_MISSING' });
  }
};

const registerVerificationMessage = 'Account created. Please enter the verification code to activate your account.';
const loginVerificationMessage = 'Your account is not verified. Enter the verification code sent to your email/phone.';

const isRejectedLoginAs = (error) => {
  const loginAsErrors = error?.response?.data?.login_as;
  return Array.isArray(loginAsErrors) && loginAsErrors.some((message) => /not a valid choice|invalid choice/i.test(message));
};

export const authService = {
  getDeviceInfo,
  normalizeAuthResponse,
  mapAuthError,

  async loginCustomer(email, password) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || password === '' || typeof password === 'undefined' || password === null) {
      throw new AuthError('Email and password are required.', { code: 'VALIDATION_ERROR' });
    }
    ensureStoreId();

    const payload = {
      login_as: 'customer',
      email: normalizedEmail,
      password,
      ...getDeviceInfo(),
      store_id: config.API.STORE_ID,
    };

    try {
      const { data } = await client.post('/login/', payload);
      const { token, user } = normalizeAuthResponse(data, normalizedEmail);
      if (!token) throw new AuthError('Osimart did not return a session token.', { code: 'TOKEN_MISSING' });
      authSession.set(token, user);
      return user;
    } catch (error) {
      if (isRejectedLoginAs(error)) {
        try {
          const { data } = await client.post('/login/', { ...payload, login_as: 'custmer' });
          const { token, user } = normalizeAuthResponse(data, normalizedEmail);
          if (!token) throw new AuthError('Osimart did not return a session token.', { code: 'TOKEN_MISSING' });
          authSession.set(token, user);
          return user;
        } catch (retryError) {
          throw mapAuthError(retryError, 'Unable to sign in.');
        }
      }
      throw mapAuthError(error, 'Unable to sign in.');
    }
  },

  async registerCustomer({ firstName, lastName, email, password, phone }) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedFirstName = firstName?.trim();
    const normalizedLastName = lastName?.trim();
    const normalizedPhone = normalizeLebanonMobileNumber(phone);
    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !password || !phone?.trim()) {
      throw new AuthError('First name, last name, email, phone, and password are required.', { code: 'VALIDATION_ERROR' });
    }
    const phoneError = validateLebanonMobileNumber(phone);
    if (phoneError) throw new AuthError(phoneError, { code: 'VALIDATION_ERROR' });
    const passwordError = validatePassword(password);
    if (passwordError) throw new AuthError(passwordError, { code: 'VALIDATION_ERROR' });
    ensureStoreId();

    try {
      const { data } = await client.post('/register/', {
        register_as: 'customer',
        store_id: config.API.STORE_ID,
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: normalizedEmail,
        password,
        mobile_number: normalizedPhone,
      });
      const { token, user } = normalizeAuthResponse(data, normalizedEmail);
      if (token) {
        authSession.set(token, user);
        return { user, requiresLogin: false };
      }

      return {
        user,
        requiresLogin: true,
        verificationRequired: true,
        loginError: registerVerificationMessage,
        message: registerVerificationMessage,
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
      throw mapAuthError(error, fallback);
    }
  },

  async verifyCustomer({ email, code }) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedCode = code?.trim();
    if (!normalizedEmail || !normalizedCode) {
      throw new AuthError('Email and verification code are required.', { code: 'VALIDATION_ERROR' });
    }
    ensureStoreId();
    try {
      const { data } = await client.post('/verify/', {
        verify_as: 'customer',
        code: normalizedCode,
        store_id: config.API.STORE_ID,
        email: normalizedEmail,
      });
      const { token, user } = normalizeAuthResponse(data, normalizedEmail);
      if (token) {
        authSession.set(token, user);
        return { user, requiresLogin: false, verified: true };
      }
      return {
        user,
        requiresLogin: true,
        verified: true,
        email: normalizedEmail,
        message: 'Account verified. Please sign in.',
      };
    } catch (error) {
      throw mapAuthError(error, 'Unable to verify your account right now.');
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
      throw mapAuthError(error, error.message || 'Google sign-in could not be completed.');
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
      throw mapAuthError(error, 'Unable to request a password reset right now. Please try again later.');
    }
  },

  async resendCustomerVerificationCode(email) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) throw new AuthError('Enter your email before requesting a verification code.', { code: 'VALIDATION_ERROR' });
    ensureStoreId();
    try {
      await client.post('/regen/', {
        email: normalizedEmail,
        verify_as: 'customer',
        store_id: config.API.STORE_ID,
      });
      return { email: normalizedEmail, message: 'Verification code sent. Check your email or phone.' };
    } catch (error) {
      throw mapAuthError(error, 'Unable to resend verification right now. Please try again later.');
    }
  },

  logout() {
    authSession.clear();
  },
};

authService.login = authService.loginCustomer;
authService.register = authService.registerCustomer;
authService.verify = authService.verifyCustomer;
authService.resendVerification = authService.resendCustomerVerificationCode;
authService.loginVerificationMessage = loginVerificationMessage;
