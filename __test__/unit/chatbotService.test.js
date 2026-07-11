import { afterEach, describe, expect, it, vi } from 'vitest';

const loadService = async () => {
  vi.resetModules();
  vi.stubEnv('VITE_CHATBOT_PROXY_URL', '/api/chatbot');
  return import('@/services/chatbotService');
};

const jsonResponse = (payload, init = {}) => new Response(JSON.stringify(payload), {
  status: init.status || 200,
  headers: { 'Content-Type': 'application/json' },
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('chatbotService', () => {
  it('sends one safe non-streaming request and parses a successful reply', async () => {
    const { sendChatMessage, CHATBOT_MODEL, TECHHUB_SYSTEM_PROMPT } = await loadService();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ reply: 'Add an item from a product page.' }));
    vi.stubGlobal('fetch', fetchMock);

    const reply = await sendChatMessage({
      message: 'How do I add a product to my cart?',
      conversation: [
        { role: 'assistant', content: 'Welcome' },
        { role: 'system', content: 'drop me' },
        { role: 'user', content: 'previous' },
      ],
      catalog: [{ name: 'Nova X 5G', price: 899 }],
      context: {
        route: '/products/nova-x-5g',
        auth: { isAuthenticated: true },
        cart: { itemCount: 1, subtotal: 899, hasUnavailableItems: false },
        wishlist: { itemCount: 2 },
      },
    });

    expect(reply).toBe('Add an item from a product page.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/chatbot');
    expect(options.method).toBe('POST');
    expect(options.credentials).toBe('include');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body.message).toBe('How do I add a product to my cart?');
    expect(body.stream).toBe(false);
    expect(body.model).toBe(CHATBOT_MODEL);
    expect(body.systemPrompt).toContain('TechHub AI Assistant');
    expect(TECHHUB_SYSTEM_PROMPT).toContain('Never invent products');
    expect(body.conversation).toEqual([
      { role: 'assistant', content: 'Welcome' },
      { role: 'user', content: 'previous' },
    ]);
    expect(body.context.auth).toEqual({ isAuthenticated: true });
  });

  it('parses backend-wrapped and chat-completions response shapes', async () => {
    const { parseChatReply } = await loadService();

    expect(parseChatReply({ data: { message: 'Wrapped message' } })).toBe('Wrapped message');
    expect(parseChatReply({ choices: [{ message: { content: 'Choice message' } }] })).toBe('Choice message');
  });

  it('blocks empty messages before sending a request', async () => {
    const { sendChatMessage } = await loadService();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendChatMessage({ message: '   ' })).rejects.toThrow('Enter a message before sending.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'The assistant could not process that request.'],
    [401, 'The assistant is not authorized. Please check the secure chat proxy configuration.'],
    [403, 'The assistant is blocked from this origin or account.'],
    [404, 'The assistant endpoint is not available.'],
    [408, 'The assistant request timed out.'],
    [429, 'Too many requests. Please try again shortly.'],
    [500, 'The assistant is temporarily unavailable.'],
    [502, 'The assistant is temporarily unavailable.'],
    [503, 'The assistant is temporarily unavailable.'],
  ])('maps HTTP %s to a controlled user error', async (status, message) => {
    const { sendChatMessage } = await loadService();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'provider secret-ish error' }, { status })));

    await expect(sendChatMessage({ message: 'Help' })).rejects.toMatchObject({ status, message });
  });

  it('handles network failures without leaking raw provider details', async () => {
    const { sendChatMessage } = await loadService();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(sendChatMessage({ message: 'Help' })).rejects.toThrow('The assistant is temporarily unavailable.');
  });

  it('rejects malformed successful responses', async () => {
    const { sendChatMessage } = await loadService();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ok: true })));

    await expect(sendChatMessage({ message: 'Help' })).rejects.toMatchObject({
      code: 'MALFORMED_CHAT_RESPONSE',
    });
  });
});
