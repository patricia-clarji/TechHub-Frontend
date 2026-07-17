const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');
const clean = (value) => String(value ?? '').trim();
const normalizeMediaUrl = (value) => {
  const raw = clean(value);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  return `https://api.osimart.com/${raw.replace(/^\/+/, '')}`;
};

export const normalizeAddress = (raw = {}) => {
  const source = raw?.address && typeof raw.address === 'object' ? { ...raw.address, ...raw } : raw || {};
  const country = source.country?.name || source.country_name || source.country || '';
  const zone = source.zone?.name || source.zone_name || source.region || source.state || source.area || '';

  return {
    id: clean(pick(source.id, source.pk, source.uuid)),
    label: clean(pick(source.label, source.name, source.title, source.address_name)),
    address: clean(pick(source.address, source.street_address, source.line1, source.address_line_1, source.full_address)),
    city: clean(pick(source.city, source.town, source.address_city)),
    region: clean(zone),
    postalCode: clean(pick(source.postal_code, source.zip_code, source.zip, source.postcode)),
    country: clean(country),
    phone: clean(pick(source.phone, source.mobile, source.mobile_number)),
    notes: clean(pick(source.notes, source.delivery_notes, source.instructions)),
    isDefault: Boolean(pick(source.is_default, source.default, source.primary, false)),
    raw: source,
  };
};

export const normalizePhone = (value = '') => {
  const raw = clean(value);
  if (!raw) return { raw: '', countryCode: '', localNumber: '', e164: '' };
  const compact = raw.replace(/[^\d+]/g, '');
  const withPlus = compact.startsWith('+') ? compact : compact.startsWith('961') ? `+${compact}` : compact;
  const match = withPlus.match(/^(\+\d{1,3})(\d{6,14})$/);
  return {
    raw,
    countryCode: match?.[1] || '',
    localNumber: match?.[2] || compact.replace(/^\+?961/, ''),
    e164: withPlus.startsWith('+') ? withPlus : '',
  };
};

export const normalizeCustomerProfile = (payload = {}, fallbackEmail = '') => {
  const source = payload?.user || payload?.customer || payload?.profile || payload?.data?.user || payload?.data?.customer || payload?.data || payload || {};
  const firstName = clean(pick(source.first_name, source.firstName, source.given_name));
  const lastName = clean(pick(source.last_name, source.lastName, source.family_name));
  const email = clean(pick(source.email, source.user_email, fallbackEmail));
  const displayName = clean(pick(
    source.display_name,
    source.full_name,
    source.name,
    [firstName, lastName].filter(Boolean).join(' '),
    email ? email.split('@')[0] : ''
  ));
  const phone = clean(pick(source.mobile, source.mobile_number, source.phone, source.phone_number));
  const addresses = [
    ...((Array.isArray(source.addresses) && source.addresses) || []),
    ...((Array.isArray(source.customer_addresses) && source.customer_addresses) || []),
    ...((Array.isArray(payload?.addresses) && payload.addresses) || []),
  ].map(normalizeAddress).filter((address) => address.id || address.address || address.city);
  const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;

  return {
    id: clean(pick(source.id, source.pk, source.uuid, source.customer_id, source.user_id)),
    firstName,
    lastName,
    displayName,
    name: displayName,
    email,
    phone,
    phoneParts: normalizePhone(phone),
    avatarUrl: normalizeMediaUrl(pick(source.profile_image, source.profile_pic_path, source.avatar, source.image)),
    avatar: normalizeMediaUrl(pick(source.profile_image, source.profile_pic_path, source.avatar, source.image)),
    storeId: clean(pick(source.store?.id, source.store_id, source.store_uuid)),
    addresses,
    defaultAddress,
    raw: source,
  };
};
