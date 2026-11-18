import AsyncStorage from '@react-native-async-storage/async-storage';

// On-device JSON cache (T-050, docs/02 "Offline & performance"): persists content fetched from the
// API so the app opens and plays without a network. Entries are namespaced by a version so a shape
// change invalidates the old copies (bump `CACHE_VERSION`). AsyncStorage is the same store the
// locale (D-021) and the progress store (D-045) already use — no new dependency.

const CACHE_VERSION = 'v1';
const PREFIX = `nabd.cache.${CACHE_VERSION}:`;

interface CacheEntry<T> {
  data: T;
  /** When the entry was written (ISO) — kept so callers can judge staleness later. */
  savedAt: string;
}

const storageKey = (key: string) => `${PREFIX}${key}`;

/** Reads a cached value, or `null` when absent/unreadable (a corrupt entry is treated as a miss). */
export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

/** Writes a value to the cache, stamping the write time. */
export async function writeCache<T>(key: string, data: T): Promise<void> {
  const entry: CacheEntry<T> = { data, savedAt: new Date().toISOString() };
  await AsyncStorage.setItem(storageKey(key), JSON.stringify(entry));
}
