import axios from 'axios';
import config from '@/config';
import { authSession } from './authSession';

const client = axios.create({
  baseURL: config.API.OSIMART_AUTH_URL,
  timeout: 12000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

const messageFrom = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors[0];
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

export const authService = {
  async login(email, password) {
    try {
      const { data } = await client.post('/login/', {
        email: email.trim().toLowerCase(),
        password,
        login_as: 'customer',
        store_id: config.API.STORE_ID,
      });
      const token = extractToken(data);
      if (!token) throw new Error('Osimart did not return a session token.');
      const user = extractUser(data, email);
      authSession.set(token, user);
      return user;
    } catch (error) {
      throw new Error(messageFrom(error, error.message || 'Unable to sign in.'));
    }
  },

  async register({ firstName, lastName, email, password, phone }) {
    try {
      const { data } = await client.post('/register/', {
        register_as: 'customer',
        store_id: config.API.STORE_ID,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        mobile_number: phone.trim(),
      });
      const token = extractToken(data);
      if (!token) return { user: null, requiresLogin: true };
      const user = extractUser(data, email);
      authSession.set(token, user);
      return { user, requiresLogin: false };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 409) {
        throw new Error('Unable to create an account with those details. Check the form or use password recovery.');
      }
      throw new Error('Unable to create your account right now. Please try again later.');
    }
  },

  async loginWithGoogle(credential) {
    if (!credential) throw new Error('Google did not return a valid credential.');
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

  logout() {
    authSession.clear();
  },
};
