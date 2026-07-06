const isDev = import.meta.env.DEV;

const safePrint = (fn, ...args) => {
  try {
    if (isDev) fn(...args);
  } catch {
    return undefined;
  }
};

export const debug = (...args) => safePrint(console.debug, ...args);
export const info = (...args) => safePrint(console.info, ...args);
export const warn = (...args) => safePrint(console.warn, ...args);
export const error = (...args) => safePrint(console.error, ...args);

export default {
  debug,
  info,
  warn,
  error,
};
