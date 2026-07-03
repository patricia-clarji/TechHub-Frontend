import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const getNestedValue = (source, path) => {
  return path.split('.').reduce((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, source);
};

const setNestedValue = (source, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const parent = keys.reduce((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, source);

  if (parent && lastKey) {
    parent[lastKey] = value;
  }
};

export const useRouteSync = ({ source, queryMap, defaults = {}, immediate = true }) => {
  const route = useRoute();
  const router = useRouter();

  const syncFromRoute = () => {
    Object.entries(queryMap).forEach(([queryKey, storePath]) => {
      const routeValue = route.query[queryKey];
      const defaultValue = defaults[queryKey];
      const currentValue = getNestedValue(source, storePath);

      if (routeValue !== undefined) {
        const newValue = Array.isArray(currentValue) ? [routeValue] : routeValue;
        setNestedValue(source, storePath, newValue);
      } else if (defaultValue !== undefined) {
        setNestedValue(source, storePath, defaultValue);
      }
    });
  };

  const syncToRoute = () => {
    const query = { ...route.query };

    Object.entries(queryMap).forEach(([queryKey, storePath]) => {
      const value = getNestedValue(source, storePath);
      const defaultValue = defaults[queryKey];
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      const isDefault = defaultValue !== undefined && JSON.stringify(value) === JSON.stringify(defaultValue);

      if (value === undefined || value === null || value === '' || isEmptyArray || isDefault) {
        delete query[queryKey];
        return;
      }

      query[queryKey] = Array.isArray(value) ? value[0] : value;
    });

    router.replace({ query });
  };

  if (immediate) {
    syncFromRoute();
  }

  watch(
    () => route.query,
    syncFromRoute,
    { immediate }
  );

  Object.entries(queryMap).forEach(([queryKey, storePath]) => {
    watch(
      () => getNestedValue(source, storePath),
      syncToRoute,
      { deep: true }
    );
  });
};
