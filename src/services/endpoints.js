export const AUTH_ENDPOINTS = Object.freeze({
  login: '/login/',
  register: '/register/',
  verify: '/verify/',
  resendVerification: '/regen/',
  googleLogin: '/login/google/',
  forgotPassword: '/forgot-password/',
  resetPassword: '/reset-password/',
  changePassword: '/change-password/',
  refresh: '/refresh/',
  logout: '/logout/',
});

export const STOREFRONT_ENDPOINTS = Object.freeze({
  banners: '/banners/',
  products: '/products/',
  productDetail: (id) => `/products/${encodeURIComponent(id)}/`,
  categories: '/categories/',
  brands: '/brands/',
});
