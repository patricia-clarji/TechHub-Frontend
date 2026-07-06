let loader;
let initializedClientId = '';
let activeCallback = null;

export const loadGoogleIdentity = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity]');
    const script = existing || document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => window.google?.accounts?.id
      ? resolve(window.google)
      : reject(new Error('Google Identity Services did not initialize.'));
    script.onerror = () => reject(new Error('Google Identity Services could not be loaded.'));
    if (!existing) document.head.appendChild(script);
  });

  return loader;
};

export const renderGoogleButton = async ({ clientId, element, callback, theme = 'outline' }) => {
  if (!clientId || !element) return;
  const google = await loadGoogleIdentity();
  activeCallback = callback;
  if (initializedClientId !== clientId) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => activeCallback?.(response),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    initializedClientId = clientId;
  }
  element.replaceChildren();
  google.accounts.id.renderButton(element, {
    type: 'standard',
    theme,
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    width: Math.min(360, Math.max(240, element.clientWidth || 320)),
  });
};
