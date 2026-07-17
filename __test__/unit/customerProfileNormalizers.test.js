import { describe, expect, it } from 'vitest';
import { normalizeAddress, normalizeCustomerProfile, normalizePhone } from '@/services/customerProfileNormalizers';
import { normalizeDealProduct } from '@/services/normalizers';
import { normalizeBanner } from '@/stores/catalog/osimartBanners';

describe('customer profile normalization', () => {
  it('maps common Osimart customer fields into one profile model', () => {
    const profile = normalizeCustomerProfile({
      customer: {
        id: 'customer-1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+96170123456',
        profile_image: 'static/profile.jpg',
        addresses: [{ id: 'addr-1', address: 'Main Street', city: 'Beirut', is_default: true }],
      },
    });

    expect(profile).toMatchObject({
      id: 'customer-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+96170123456',
    });
    expect(profile.avatarUrl).toBe('https://api.osimart.com/static/profile.jpg');
    expect(profile.defaultAddress).toMatchObject({ id: 'addr-1', city: 'Beirut' });
  });

  it('uses clean fallbacks when optional profile fields are missing', () => {
    const profile = normalizeCustomerProfile({ email: 'customer@example.com' });

    expect(profile.displayName).toBe('customer');
    expect(profile.firstName).toBe('');
    expect(profile.phone).toBe('');
    expect(profile.addresses).toEqual([]);
  });

  it('normalizes phone and address field variations', () => {
    expect(normalizePhone('961 70 123 456')).toMatchObject({
      countryCode: '+961',
      localNumber: '70123456',
      e164: '+96170123456',
    });
    expect(normalizeAddress({
      street_address: 'Delivery Road',
      town: 'Byblos',
      zip: '1401',
      zone: { name: 'Mount Lebanon' },
    })).toMatchObject({
      address: 'Delivery Road',
      city: 'Byblos',
      region: 'Mount Lebanon',
      postalCode: '1401',
    });
  });
});

describe('homepage banner normalization', () => {
  it('keeps title and image from the same API object with safe absolute media URLs', () => {
    const banner = normalizeBanner({
      id: 'banner-1',
      title: 'Launch Week',
      desktop_image: 'images/launch.jpg',
      mobile_image: 'https://cdn.example.com/mobile.jpg',
    });

    expect(banner.title).toBe('Launch Week');
    expect(banner.image).toBe('https://api.osimart.com/images/launch.jpg');
    expect(banner.mobile_image).toBe('https://cdn.example.com/mobile.jpg');
  });
});

describe('deal normalization', () => {
  it('keeps only products with real discounted pricing', () => {
    expect(normalizeDealProduct({ id: 'p1', price: 80, oldPrice: 100 })).toMatchObject({
      savingsPercent: 20,
    });
    expect(normalizeDealProduct({ id: 'p2', price: 100, oldPrice: 100 })).toBeNull();
    expect(normalizeDealProduct({ id: 'p3', price: 0, oldPrice: 100 })).toBeNull();
  });
});
