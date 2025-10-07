

interface CachedData<T> {
  expiry: number;
  data: T;
}

/**
 * Sets an item in localStorage with a Time-To-Live (TTL).
 * @param key The key for the cache entry.
 * @param data The data to be stored.
 * @param ttlMinutes The time-to-live in minutes.
 */
export const setCache = <T>(key: string, data: T, ttlMinutes: number): void => {
  const now = new Date();
  const expiry = now.getTime() + ttlMinutes * 60 * 1000;
  const item: CachedData<T> = {
    data,
    expiry,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting cache for key "${key}":`, error);
  }
};

/**
 * Gets an item from localStorage if it hasn't expired.
 * @param key The key for the cache entry.
 * @returns The cached data or null if not found or expired.
 */
export const getCache = <T>(key: string): T | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item: CachedData<T> = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key); // Cache expired
      return null;
    }
    return item.data;
  } catch (error) {
    console.error(`Error getting cache for key "${key}":`, error);
    return null;
  }
};

/**
 * Gets an item from localStorage, regardless of its expiry.
 * This is useful for "stale-while-revalidate" strategies.
 * @param key The key for the cache entry.
 * @returns The cached data or null if not found.
 */
export const getAnyCache = <T>(key: string): T | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item: CachedData<T> = JSON.parse(itemStr);
    return item.data;
  } catch (error) {
    console.error(`Error getting any cache for key "${key}":`, error);
    return null;
  }
};

/**
 * Clears all cache entries related to sheet data.
 */
export const clearSheetCache = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sheet_data_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error("Error clearing sheet data cache:", error);
  }
};