import { createApiError } from '@/services/errorHandler';
import logger from '@/utils/logger';

const proxyUrl = String(import.meta.env.VITE_CHATBOT_PROXY_URL || '/api/chatbot').trim();

export const CHATBOT_MODEL = 'deepseek/deepseek-chat';

export const TECHHUB_SYSTEM_PROMPT = `You are TechHub AI Assistant, the shopping and customer-support assistant for TechHub.
Answer only about the TechHub platform, products, cart, wishlist, account, verification, profile, orders, shipping, returns, warranty, promotions, policies, navigation, troubleshooting, and shopping assistance.
Use real TechHub context when it is provided. Never invent products, prices, stock, policies, promotions, order details, private account data, passwords, tokens, or verification codes. If information is unavailable, say so clearly and distinguish confirmed details from suggestions.`;

export const isChatbotConfigured = Boolean(proxyUrl);

function getSafeProxyUrl() {
  if (!proxyUrl) {
    throw createApiError({ message: 'The chat proxy URL is not configured.' });
  }
  const url = new URL(proxyUrl, window.location.origin);
  if (url.origin !== window.location.origin) {
    throw createApiError({ message: 'The chat proxy must use the TechHub origin.' });
  }
  return url.toString();
}

function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readSseLine(line) {
  if (!line.startsWith('data: ') || line === 'data: [DONE]') return '';
  const payload = JSON.parse(line.slice(6));
  return payload?.choices?.[0]?.delta?.content || '';
}

export function parseChatReply(payload) {
  const reply = payload?.reply
    || payload?.message
    || payload?.data?.reply
    || payload?.data?.message
    || payload?.choices?.[0]?.message?.content
    || payload?.choices?.[0]?.text;

  if (typeof reply !== 'string' || !reply.trim()) {
    throw createApiError({ message: 'The chat service returned an unsupported response shape.', code: 'MALFORMED_CHAT_RESPONSE' });
  }

  return reply.trim();
}

export function mapChatError({ status = null, payload = null, fallback = '' } = {}) {
  const safeDetail = typeof payload?.detail === 'string'
    ? payload.detail
    : (typeof payload?.message === 'string' ? payload.message : '');

  const byStatus = {
    400: 'The assistant could not process that request.',
    401: 'The assistant is not authorized. Please check the secure chat proxy configuration.',
    403: 'The assistant is blocked from this origin or account.',
    404: 'The assistant endpoint is not available.',
    408: 'The assistant request timed out.',
    429: 'Too many requests. Please try again shortly.',
    500: 'The assistant is temporarily unavailable.',
    502: 'The assistant is temporarily unavailable.',
    503: 'The assistant is temporarily unavailable.'
  };

  return createApiError({
    message: byStatus[status] || safeDetail || fallback || 'The assistant is temporarily unavailable.',
    status,
    code: status ? `CHAT_HTTP_${status}` : null
  });
}

function sanitizeConversation(conversation) {
  return (Array.isArray(conversation) ? conversation : [])
    .filter((item) => ['user', 'assistant'].includes(item?.role) && typeof item?.content === 'string')
    .slice(-8)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 2000) }));
}

function sanitizeContext(context) {
  if (!context || typeof context !== 'object') return {};
  return {
    route: typeof context.route === 'string' ? context.route.slice(0, 160) : '',
    auth: context.auth ? { isAuthenticated: Boolean(context.auth.isAuthenticated) } : undefined,
    cart: context.cart ? {
      itemCount: Number(context.cart.itemCount) || 0,
      subtotal: Number(context.cart.subtotal) || 0,
      hasUnavailableItems: Boolean(context.cart.hasUnavailableItems)
    } : undefined,
    wishlist: context.wishlist ? { itemCount: Number(context.wishlist.itemCount) || 0 } : undefined,
    currentProduct: context.currentProduct ? {
      name: String(context.currentProduct.name || '').slice(0, 120),
      price: context.currentProduct.price,
      category: String(context.currentProduct.category || '').slice(0, 80),
      brand: String(context.currentProduct.brand || '').slice(0, 80),
      inStock: Boolean(context.currentProduct.inStock),
      stock: Number.isFinite(Number(context.currentProduct.stock)) ? Number(context.currentProduct.stock) : undefined
    } : undefined
  };
}

export async function sendChatMessage({ message, conversation = [], catalog = [], context = {}, signal, onChunk }) {
  const text = String(message || '').trim();
  if (!text) throw createApiError({ message: 'Enter a message before sending.' });

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30_000);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const response = await fetch(getSafeProxyUrl(), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        conversation: sanitizeConversation(conversation),
        catalog,
        context: sanitizeContext(context),
        model: CHATBOT_MODEL,
        systemPrompt: TECHHUB_SYSTEM_PROMPT,
        stream: typeof onChunk === 'function'
      }),
      signal: controller.signal
    });

    const responseText = typeof onChunk === 'function' && response.ok && response.body
      ? ''
      : await response.text();

    if (!response.ok) {
      const errorPayload = safeJsonParse(responseText);
      throw mapChatError({ status: response.status, payload: errorPayload });
    }

    if (typeof onChunk === 'function' && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let reply = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          try {
            const chunk = readSseLine(line.trim());
            if (!chunk) continue;
            reply += chunk;
            onChunk(chunk, reply);
          } catch {
            // Ignore malformed partial frames while the stream continues.
          }
        }
      }

      if (!reply.trim()) throw createApiError({ message: 'The chat service returned an invalid response.' });
      return reply.trim();
    }

    const payload = safeJsonParse(responseText);
    return parseChatReply(payload);
  } catch (error) {
    if (error?.name === 'ApiError') throw error;
    if (error?.name === 'AbortError') throw mapChatError({ status: 408 });
    logger.warn('Safe chatbot diagnostic:', { message: error?.message, name: error?.name });
    throw createApiError({ message: 'The assistant is temporarily unavailable.' });
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}
