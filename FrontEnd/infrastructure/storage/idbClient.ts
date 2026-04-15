import { openDB, type DBSchema, type IDBPDatabase } from "idb";

const DB_NAME = "hms-cache";
const DB_VERSION = 5;

const STORE_NAMES = [
  "plans",
  "tenants",
  "users",
  "settings",
  "subscriptions",
  "tenantConfigs",
  "roles",
  "roomTypes",
  "roomCategories",
  "permissions",
  "supportCategories",
] as const;

export type CacheStoreName = (typeof STORE_NAMES)[number];

export interface CacheEntry<T> {
  value: T;
  hash: string;
  updatedAt: number;
}

export interface CacheFreshnessOptions {
  ttlMs: number;
  deleteIfStale?: boolean;
}

interface CacheDB extends DBSchema {
  plans: {
    key: string;
    value: CacheEntry<unknown>;
  };
  tenants: {
    key: string;
    value: CacheEntry<unknown>;
  };
  users: {
    key: string;
    value: CacheEntry<unknown>;
  };
  settings: {
    key: string;
    value: CacheEntry<unknown>;
  };
  subscriptions: {
    key: string;
    value: CacheEntry<unknown>;
  };
  tenantConfigs: {
    key: string;
    value: CacheEntry<unknown>;
  };
  roles: {
    key: string;
    value: CacheEntry<unknown>;
  };
  roomTypes: {
    key: string;
    value: CacheEntry<unknown>;
  };
  roomCategories: {
    key: string;
    value: CacheEntry<unknown>;
  };
  permissions: {
    key: string;
    value: CacheEntry<unknown>;
  };
  supportCategories: {
    key: string;
    value: CacheEntry<unknown>;
  };
}

const isBrowser =
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

let dbPromise: Promise<IDBPDatabase<CacheDB>> | null = null;

function getDb(): Promise<IDBPDatabase<CacheDB>> | null {
  if (!isBrowser) return null;
  if (!dbPromise) {
    dbPromise = openDB<CacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORE_NAMES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }
      },
    });
  }
  return dbPromise;
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === "object" && val !== null) {
      if (seen.has(val as object)) {
        return "[Circular]";
      }
      seen.add(val as object);
      if (Array.isArray(val)) {
        return val;
      }
      const sorted: Record<string, unknown> = {};
      Object.keys(val)
        .sort()
        .forEach((k) => {
          sorted[k] = (val as Record<string, unknown>)[k];
        });
      return sorted;
    }
    return val;
  });
}

function hashValue(value: unknown): string {
  const input = stableStringify(value);
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

export function tenantKey(
  tenantId: string,
  store: CacheStoreName,
  suffix?: string,
): string {
  const base = `tenant_${tenantId}::${store}`;
  return suffix ? `${base}::${suffix}` : base;
}

export function globalKey(
  store: CacheStoreName,
  suffix?: string,
): string {
  const base = `global::${store}`;
  return suffix ? `${base}::${suffix}` : base;
}

export function tenantConfigKey(tenantId: string): string {
  return tenantKey(tenantId, "tenantConfigs", "config");
}

export async function getCacheEntry<T>(
  store: CacheStoreName,
  key: string,
): Promise<CacheEntry<T> | null> {
  const db = getDb();
  if (!db) return null;
  const value = await (await db).get(store, key);
  return (value as CacheEntry<T> | undefined) ?? null;
}

export async function getCached<T>(
  store: CacheStoreName,
  key: string,
): Promise<T | null> {
  const entry = await getCacheEntry<T>(store, key);
  return entry ? entry.value : null;
}

export function isCacheEntryStale(
  entry: Pick<CacheEntry<unknown>, "updatedAt"> | null,
  ttlMs: number,
): boolean {
  if (!entry) return true;
  if (ttlMs <= 0) return true;
  return Date.now() - entry.updatedAt > ttlMs;
}

export async function getCachedFresh<T>(
  store: CacheStoreName,
  key: string,
  options: CacheFreshnessOptions,
): Promise<T | null> {
  const entry = await getCacheEntry<T>(store, key);
  if (!entry) return null;

  const stale = isCacheEntryStale(entry, options.ttlMs);
  if (!stale) return entry.value;

  if (options.deleteIfStale) {
    await deleteCacheKey(store, key);
  }
  return null;
}

export async function setCached<T>(
  store: CacheStoreName,
  key: string,
  value: T,
): Promise<CacheEntry<T> | null> {
  const db = getDb();
  if (!db) return null;
  const entry: CacheEntry<T> = {
    value,
    hash: hashValue(value),
    updatedAt: Date.now(),
  };
  await (await db).put(store, entry, key);
  return entry;
}

export async function setCachedIfChanged<T>(
  store: CacheStoreName,
  key: string,
  value: T,
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const existing = await (await db).get(store, key);
  const nextHash = hashValue(value);
  if (existing && (existing as CacheEntry<T>).hash === nextHash) {
    return false;
  }
  const entry: CacheEntry<T> = {
    value,
    hash: nextHash,
    updatedAt: Date.now(),
  };
  await (await db).put(store, entry, key);
  return true;
}

export async function deleteCacheKey(
  store: CacheStoreName,
  key: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await (await db).delete(store, key);
}

export async function clearTenantCache(tenantId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const prefix = `tenant_${tenantId}::`;
  const database = await db;

  await Promise.all(
    STORE_NAMES.map(async (store) => {
      const tx = database.transaction(store, "readwrite");
      let cursor = await tx.store.openCursor();
      while (cursor) {
        if (String(cursor.key).startsWith(prefix)) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      await tx.done;
    }),
  );
}

export async function clearAllCache(): Promise<void> {
  const db = getDb();
  if (!db) return;
  const database = await db;
  await Promise.all(STORE_NAMES.map((store) => database.clear(store)));
}
