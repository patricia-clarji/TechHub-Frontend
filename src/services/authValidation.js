const LEBANON_COUNTRY_CODE = '+961';
const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'letmein123',
]);

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

export const validatePassword = (password = '') => {
  const value = String(password);
  if (!value) return 'Enter your password.';
  if (value.length <= 8) return 'Use more than 8 characters for your password.';
  if (COMMON_PASSWORDS.has(value.trim().toLowerCase())) return 'Choose a stronger password that is not commonly used.';
  return '';
};

export const normalizeLebanonMobileNumber = (input = '', countryCode = LEBANON_COUNTRY_CODE) => {
  const raw = String(input).trim();
  const countryDigits = digitsOnly(countryCode);
  let localDigits = digitsOnly(raw);

  if (localDigits.startsWith('00')) localDigits = localDigits.slice(2);
  if (localDigits.startsWith(countryDigits)) localDigits = localDigits.slice(countryDigits.length);
  if (localDigits.startsWith('0')) localDigits = localDigits.slice(1);

  return `${countryCode}${localDigits}`;
};

export const validateLebanonMobileNumber = (input = '') => {
  const raw = String(input).trim();
  if (!raw) return 'Enter your mobile number.';
  if (/[A-Za-z]/.test(raw) || /x/i.test(raw)) return 'Enter digits only for your mobile number.';

  const localDigits = normalizeLebanonMobileNumber(raw).slice(LEBANON_COUNTRY_CODE.length);
  if (!/^\d+$/.test(localDigits)) return 'Enter digits only for your mobile number.';
  if (localDigits.length !== 8) return 'Enter a valid Lebanon mobile number.';
  if (!['3', '70', '71', '76', '78', '79', '81'].some((prefix) => localDigits.startsWith(prefix))) {
    return 'Enter a valid Lebanon mobile number.';
  }
  return '';
};

export const getLebanonCountryCode = () => LEBANON_COUNTRY_CODE;
