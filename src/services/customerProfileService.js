import { apiClient } from '@/services/apiClient';
import { normalizeAddress, normalizeCustomerProfile } from '@/services/customerProfileNormalizers';

const CUSTOMER_INFO_ENDPOINT = '/customer-info/';
const CUSTOMER_ADDRESSES_ENDPOINT = '/customer-addresses/';

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const customerProfileService = {
  async fetchCurrentProfile(fallbackUser = null) {
    const profileResponse = await apiClient.get(CUSTOMER_INFO_ENDPOINT, {
      retries: 0,
      dedupe: false,
      authRefresh: false,
    });
    if (!profileResponse.success) throw profileResponse.error;

    let addresses = [];
    const addressResponse = await apiClient.get(CUSTOMER_ADDRESSES_ENDPOINT, {
      retries: 0,
      dedupe: false,
      authRefresh: false,
    });
    if (addressResponse.success) {
      addresses = extractList(addressResponse.data).map(normalizeAddress);
    }

    const profile = normalizeCustomerProfile(profileResponse.data, fallbackUser?.email || '');
    const mergedAddresses = addresses.length ? addresses : profile.addresses;
    return {
      ...profile,
      addresses: mergedAddresses,
      defaultAddress: mergedAddresses.find((address) => address.isDefault) || mergedAddresses[0] || profile.defaultAddress || null,
    };
  },
};

export { normalizeAddress, normalizeCustomerProfile };
