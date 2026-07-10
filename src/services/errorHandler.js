import { useToastStore } from '@/stores/ui/toast';
import logger from '@/utils/logger';

export class ApiError extends Error {
  constructor({ message, status = null, code = null, raw = null }) {
    super(message || 'API Error');
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.raw = raw;
  }
}

export const createApiError = (error) => {
  if (error instanceof ApiError) return error;

  const status = error?.status ?? error?.response?.status ?? null;
  const payload = error?.response?.data ?? {};
  const fieldMessage = payload && typeof payload === 'object'
    ? Object.entries(payload).find(([, value]) => Array.isArray(value) && typeof value[0] === 'string')
    : null;
  const nestedMessage = payload && typeof payload === 'object'
    ? Object.entries(payload).find(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
    : null;

  const message =
    (typeof payload?.detail === 'string' && payload.detail.trim()) ||
    (typeof payload?.message === 'string' && payload.message.trim()) ||
    (Array.isArray(payload?.non_field_errors) && payload.non_field_errors[0]) ||
    (fieldMessage && `${fieldMessage[0]}: ${fieldMessage[1][0]}`) ||
    (nestedMessage && `${nestedMessage[0]}: ${Object.values(nestedMessage[1]).flat().find((value) => typeof value === 'string') || 'Invalid value.'}`) ||
    (typeof error?.message === 'string' && error.message.trim()) ||
    'Unexpected API error.';

  const code = payload?.code || error?.code || null;

  const apiError = new ApiError({
    message,
    status,
    code,
    raw: error,
  });

  if (error?.code) {
    apiError.code = error.code;
  }

  return apiError;
};

export const isRetryableApiError = (error) => {
  const retryableNetworkCodes = ['ECONNABORTED', 'ERR_NETWORK', 'ERR_HTTP_REQUEST_TIMEOUT'];
  if (!error) return false;
  if (retryableNetworkCodes.includes(error.code)) return true;
  if (!error.status) return true;
  return [408, 429].includes(error.status);
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const notifyError = (message) => {
  try {
    const toastStore = useToastStore();
    toastStore.showToast(message || 'Something went wrong.', 'fa-exclamation-triangle');
  } catch (err) {
    logger.error('Unable to show toast notification:', err);
  }
};

export const handleApiError = (error, options = {}) => {
  const apiError = createApiError(error);

  if (options.notify !== false) {
    notifyError(apiError.message);
  }

  logger.error('API ERROR:', {
    status: apiError.status,
    message: apiError.message,
    code: apiError.code,
    context: options.context,
  });

  return apiError;
};

export const retryAsync = async (fn, retries = 1, delayMs = 500) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      const apiError = createApiError(error);
      attempt += 1;
      if (attempt > retries || !isRetryableApiError(apiError)) {
        throw apiError;
      }
      await delay(delayMs * 2 ** (attempt - 1));
    }
  }
};
