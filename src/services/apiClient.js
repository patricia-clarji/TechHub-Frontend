import axios from 'axios';
import config from '@/config';
import {
  createApiError,
  isRetryableApiError,
  delay,
} from './errorHandler';

const pendingRequests = new Map();

const buildRequestKey = (config) => {
  const { method, url, params, data } = config;
  const serialize = (value) => {
    try {
      return JSON.stringify(value || {});
    } catch {
      return String(value);
    }
  };
  return `${(method || 'get').toUpperCase()}|${url}|${serialize(params)}|${serialize(data)}`;
};

const client = axios.create({
  baseURL: config.API.OSIMART_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

client.interceptors.request.use((request) => {
  request.headers = request.headers || {};

  if (config.API.STORE_ID) {
    request.params = {
      ...(request.params || {}),
      store: config.API.STORE_ID,
    };
  }

  delete request.requireAuth;
  request.headers['Accept'] = 'application/json';
  request.headers['Content-Type'] = request.headers['Content-Type'] || 'application/json';

  return request;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = createApiError(error);
    return Promise.reject(apiError);
  }
);

const sendRequest = async (config) => {
  const { dedupe = true, retries = 2, retryDelay = 500, ...axiosConfig } = config;
  const requestConfig = {
    ...axiosConfig,
    signal: axiosConfig.signal || new AbortController().signal,
  };

  const requestKey = dedupe ? buildRequestKey(requestConfig) : null;
  if (requestKey && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const promise = (async () => {
    let attempt = 0;
    while (true) {
      try {
        const response = await client.request(requestConfig);
        const responseData = response?.data;
        if (typeof responseData === 'undefined') {
          const malformedError = createApiError({
            message: 'Malformed API response: missing data payload.',
            status: response?.status || null,
            raw: response,
          });
          return {
            data: null,
            success: false,
            error: malformedError,
            status: malformedError.status,
          };
        }

        return {
          data: responseData,
          success: true,
          error: null,
          status: response.status || null,
        };
      } catch (error) {
        const apiError = error instanceof Error && error.name === 'ApiError' ? error : createApiError(error);

        const shouldRetry =
          attempt < retries &&
          isRetryableApiError(apiError) &&
          ![401, 403, 404, 422].includes(apiError.status);

        attempt += 1;
        if (shouldRetry) {
          await delay(retryDelay * 2 ** (attempt - 1));
          continue;
        }

        return {
          data: null,
          success: false,
          error: apiError,
          status: apiError.status,
        };
      }
    }
  })();

  if (requestKey) {
    pendingRequests.set(requestKey, promise);
  }

  promise.finally(() => {
    if (requestKey) pendingRequests.delete(requestKey);
  });

  return promise;
};

export const apiClient = {
  request: sendRequest,
  get: async (url, options = {}) => sendRequest({ method: 'get', url, ...options }),
  post: async (url, data, options = {}) => sendRequest({ method: 'post', url, data, ...options }),
  put: async (url, data, options = {}) => sendRequest({ method: 'put', url, data, ...options }),
  delete: async (url, options = {}) => sendRequest({ method: 'delete', url, ...options }),
};
