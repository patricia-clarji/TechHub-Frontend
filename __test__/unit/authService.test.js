import { afterEach, describe, expect, it, vi } from 'vitest';

const loadAuthService = async (post = vi.fn(), options = {}) => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_OSIMART_AUTH_URL', 'https://api.example.test/auth');
  vi.stubEnv('VITE_OSIMART_STORE_ID', options.storeId ?? 'store-1');
  localStorage.clear();

  vi.doMock('axios', () => ({
    default: {
      create: vi.fn(() => ({ post })),
    },
  }));

  return import('@/services/authService');
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  localStorage.clear();
});

describe('authService login', () => {
  it('posts the real Osimart customer login payload and stores the returned token in memory', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'header.payload.signature',
        user: { id: 'customer-1', email: 'admin@example.com', first_name: 'Ada', last_name: 'Admin' },
      },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    const user = await authService.loginCustomer(' Admin@Example.com ', ' secret ');

    expect(post).toHaveBeenCalledWith('/login/', expect.objectContaining({
      login_as: 'customer',
      email: 'admin@example.com',
      password: ' secret ',
      device_name: expect.stringContaining('TechHub web'),
      device_id: expect.any(String),
      store_id: 'store-1',
    }));
    expect(post.mock.calls[0][1]).not.toHaveProperty('code');
    expect(post.mock.calls[0][1]).not.toHaveProperty('verify_as');
    expect(user).toMatchObject({ id: 'customer-1', email: 'admin@example.com', name: 'Ada Admin' });
    expect(authSession.getToken()).toBe('header.payload.signature');
  });

  it('generates a stable device_id when none exists before login', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'header.payload.signature',
        user: { id: 'customer-1', email: 'admin@example.com' },
      },
    });
    const { authService } = await loadAuthService(post);
    localStorage.setItem('techhub_auth_device_id', JSON.stringify(''));

    await authService.loginCustomer('admin@example.com', 'secret');

    expect(post).toHaveBeenCalledWith('/login/', expect.objectContaining({
      device_id: expect.stringMatching(/\S/),
      device_name: expect.stringMatching(/TechHub web/),
    }));
  });

  it('does not retry with another login_as when the backend returns invalid credentials', async () => {
    const post = vi.fn()
      .mockRejectedValueOnce({ response: { status: 400, data: { non_field_errors: ['Invalid user.'] } } });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    await expect(authService.loginCustomer('admin@example.com', 'wrong-password')).rejects.toThrow('Invalid user.');

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/login/', expect.objectContaining({ login_as: 'customer' }));
    expect(authSession.getToken()).toBe('');
  });

  it('surfaces failed login responses without faking success', async () => {
    const post = vi.fn()
      .mockRejectedValueOnce({ response: { status: 400, data: { non_field_errors: ['Invalid user.'] } } });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    await expect(authService.loginCustomer('admin@example.com', 'wrong-password')).rejects.toThrow('Invalid user.');

    expect(post).toHaveBeenCalledTimes(1);
    expect(authSession.getToken()).toBe('');
  });

  it('shows the backend unverified-account message cleanly', async () => {
    const post = vi.fn()
      .mockRejectedValueOnce({ response: { status: 400, data: { non_field_errors: ['User account is not verified.'] } } });
    const { authService } = await loadAuthService(post);

    await expect(authService.loginCustomer('new@example.com', 'StrongPassw0rd!')).rejects.toMatchObject({
      message: 'User account is not verified.',
      code: 'ACCOUNT_UNVERIFIED',
    });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).not.toHaveBeenCalledWith('/verify/', expect.anything());
    expect(post).not.toHaveBeenCalledWith('/regen/', expect.anything());
  });

  it('validates missing login fields before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.loginCustomer('', '')).rejects.toThrow('Email and password are required.');
    expect(post).not.toHaveBeenCalled();
  });

  it('shows a clear login error when the store id is missing', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post, { storeId: '' });

    await expect(authService.loginCustomer('admin@example.com', 'secret')).rejects.toThrow('Store configuration is missing. Please contact support.');
    expect(post).not.toHaveBeenCalled();
  });

  it('clears auth state on logout', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'logout-token',
        user: { id: 'customer-1', email: 'admin@example.com' },
      },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    await authService.loginCustomer('admin@example.com', 'secret');
    authService.logout();

    expect(authSession.getToken()).toBe('');
    expect(authSession.getUser()).toBeNull();
  });
});

describe('authService register', () => {
  const registerDetails = {
    firstName: 'Ada',
    lastName: 'Customer',
    email: ' Ada.Customer@Example.com ',
    phone: '70 123 456',
    password: 'StrongPassw0rd!',
  };

  it('posts the confirmed Osimart customer register payload and signs in when a token is returned', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'register-token',
        user: { id: 'customer-3', email: 'ada.customer@example.com', first_name: 'Ada', last_name: 'Customer' },
      },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    const result = await authService.registerCustomer(registerDetails);

    expect(post).toHaveBeenCalledWith('/register/', {
      register_as: 'customer',
      store_id: 'store-1',
      first_name: 'Ada',
      last_name: 'Customer',
      email: 'ada.customer@example.com',
      password: 'StrongPassw0rd!',
      mobile_number: '+96170123456',
    });
    expect(result.requiresLogin).toBe(false);
    expect(result.user).toMatchObject({ id: 'customer-3', email: 'ada.customer@example.com', name: 'Ada Customer' });
    expect(authSession.getToken()).toBe('register-token');
  });

  it('returns verification-required state after a successful register response without a token', async () => {
    const post = vi.fn()
      .mockResolvedValueOnce({
        data: { id: 'customer-4', email: 'ada.customer@example.com', first_name: 'Ada', last_name: 'Customer' },
      });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    const result = await authService.registerCustomer(registerDetails);

    expect(post).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      requiresLogin: true,
      verificationRequired: true,
      message: 'Account created. Please enter the verification code to activate your account.',
      email: 'ada.customer@example.com',
    });
    expect(result.user).toMatchObject({ id: 'customer-4', email: 'ada.customer@example.com' });
    expect(authSession.getToken()).toBe('');
  });

  it('skips auto-login when verification is required after register', async () => {
    const post = vi.fn()
      .mockResolvedValueOnce({
        data: { id: 'customer-5', email: 'ada.customer@example.com' },
      });
    const { authService } = await loadAuthService(post);

    const result = await authService.registerCustomer(registerDetails);

    expect(result.verificationRequired).toBe(true);
    expect(post).not.toHaveBeenCalledWith('/login/', expect.anything());
  });

  it('surfaces register field errors from the backend without faking success', async () => {
    const post = vi.fn().mockRejectedValue({
      response: {
        status: 400,
        data: { email: ['Store is required.'], password: ['This password is too short.'] },
      },
    });
    const { authService } = await loadAuthService(post);

    await expect(authService.registerCustomer(registerDetails)).rejects.toThrow('email: Store is required.');
  });

  it('validates missing register fields before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.registerCustomer({ ...registerDetails, phone: '' })).rejects.toThrow('First name, last name, email, phone, and password are required.');
    expect(post).not.toHaveBeenCalled();
  });

  it('blocks invalid phone values before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.registerCustomer({ ...registerDetails, phone: '12 34' })).rejects.toThrow('Enter a valid Lebanon mobile number.');
    expect(post).not.toHaveBeenCalled();
  });

  it('blocks placeholder phone values before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.registerCustomer({ ...registerDetails, phone: 'XX XXX XXX' })).rejects.toThrow('Enter digits only for your mobile number.');
    expect(post).not.toHaveBeenCalled();
  });

  it('blocks common passwords before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.registerCustomer({ ...registerDetails, password: 'abc123456' })).rejects.toThrow('Choose a stronger password that is not commonly used.');
    expect(post).not.toHaveBeenCalled();
  });

  it('blocks passwords that are 8 characters or shorter before calling the backend', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post);

    await expect(authService.registerCustomer({ ...registerDetails, password: 'Abcd1234' })).rejects.toThrow('Use more than 8 characters for your password.');
    expect(post).not.toHaveBeenCalled();
  });

  it('shows a clear register error when the store id is missing', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post, { storeId: '' });

    await expect(authService.registerCustomer(registerDetails)).rejects.toThrow('Store configuration is missing. Please contact support.');
    expect(post).not.toHaveBeenCalled();
  });

  it('posts the confirmed resend verification payload', async () => {
    const post = vi.fn().mockResolvedValue({ data: {} });
    const { authService } = await loadAuthService(post);

    await authService.resendCustomerVerificationCode(' Ada.Customer@Example.com ');

    expect(post).toHaveBeenCalledWith('/regen/', {
      email: 'ada.customer@example.com',
      verify_as: 'customer',
      store_id: 'store-1',
    });
  });
});


describe('authService verification', () => {
  it('posts the confirmed verify payload and returns login-required when no token is returned', async () => {
    const post = vi.fn().mockResolvedValue({
      data: { email: 'ada.customer@example.com', first_name: 'Ada' },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    const result = await authService.verifyCustomer({ email: ' Ada.Customer@Example.com ', code: ' 123456 ' });

    expect(post).toHaveBeenCalledWith('/verify/', {
      verify_as: 'customer',
      code: '123456',
      store_id: 'store-1',
      email: 'ada.customer@example.com',
    });
    expect(result).toMatchObject({
      verified: true,
      requiresLogin: true,
      message: 'Account verified. Please sign in.',
      email: 'ada.customer@example.com',
    });
    expect(authSession.getToken()).toBe('');
  });

  it('stores auth when verify returns a token', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        access: 'verified-token',
        user: { id: 'customer-7', email: 'ada.customer@example.com' },
      },
    });
    const { authService } = await loadAuthService(post);
    const { authSession } = await import('@/services/authSession');

    const result = await authService.verifyCustomer({ email: 'ada.customer@example.com', code: '123456' });

    expect(result.requiresLogin).toBe(false);
    expect(authSession.getToken()).toBe('verified-token');
  });

  it('surfaces verify backend validation errors cleanly', async () => {
    const post = vi.fn().mockRejectedValue({
      response: { status: 400, data: { code: ['Invalid verification code.'] } },
    });
    const { authService } = await loadAuthService(post);

    await expect(authService.verifyCustomer({ email: 'ada.customer@example.com', code: '000000' })).rejects.toMatchObject({
      message: 'code: Invalid verification code.',
      code: 'INVALID_VERIFICATION_CODE',
    });
  });

  it('blocks verify when store id is missing', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post, { storeId: '' });

    await expect(authService.verifyCustomer({ email: 'ada.customer@example.com', code: '123456' })).rejects.toThrow('Store configuration is missing. Please contact support.');
    expect(post).not.toHaveBeenCalled();
  });

  it('blocks resend verification when store id is missing', async () => {
    const post = vi.fn();
    const { authService } = await loadAuthService(post, { storeId: '' });

    await expect(authService.resendCustomerVerificationCode('ada.customer@example.com')).rejects.toThrow('Store configuration is missing. Please contact support.');
    expect(post).not.toHaveBeenCalled();
  });
});

