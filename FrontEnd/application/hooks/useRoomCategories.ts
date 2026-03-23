import { useCallback, useState } from "react";

import { httpClient } from "../../infrastructure/http/client";
import {
  deleteCacheKey,
  getCachedFresh,
  setCached,
  tenantKey,
} from "../../infrastructure/storage/idbClient";

export interface RoomCategoryData {
  id: string;
  tenantId?: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  displayOrder: number;
}

export interface RoomCategoryMutationPayload {
  name: string;
  description?: string | null;
  image_urls?: string[];
  display_order?: number;
}

const ROOM_CATEGORIES_STORE = "roomCategories";
const ROOM_CATEGORIES_TTL_MS = 10 * 60 * 1000;

function mapCategory(item: any): RoomCategoryData {
  return {
    id: String(item.id),
    tenantId: item.tenant_id ?? item.tenantId,
    name: item.name,
    description: item.description ?? null,
    imageUrls: Array.isArray(item.image_urls)
      ? item.image_urls.filter(Boolean)
      : Array.isArray(item.imageUrls)
      ? item.imageUrls.filter(Boolean)
      : [],
    displayOrder: Number(item.display_order ?? item.displayOrder ?? 0),
  };
}

export function useRoomCategories() {
  const [categories, setCategories] = useState<RoomCategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLocal = useCallback((items: RoomCategoryData[]) => {
    const normalized = [...items].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
    setCategories(normalized);
    return normalized;
  }, []);

  const fetchCategories = useCallback(
    async (tenantId: string, force = false) => {
      const key = tenantKey(tenantId, ROOM_CATEGORIES_STORE);
      setLoading(true);
      setError(null);
      try {
        if (!force) {
          const cached = await getCachedFresh<RoomCategoryData[]>(
            ROOM_CATEGORIES_STORE,
            key,
            { ttlMs: ROOM_CATEGORIES_TTL_MS, deleteIfStale: true }
          );
          if (cached) {
            refreshLocal(cached);
            return cached;
          }
        }

        const data = await httpClient.get<any[]>(`api/tenants/${tenantId}/categories`);
        const mapped = refreshLocal(data.map(mapCategory));
        await setCached(ROOM_CATEGORIES_STORE, key, mapped);
        return mapped;
      } catch (err: any) {
        setError(err?.message || "Failed to fetch room categories");
        setCategories([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [refreshLocal]
  );

  const createCategory = useCallback(
    async (tenantId: string, payload: RoomCategoryMutationPayload) => {
      const created = await httpClient.post<any>(
        `api/tenants/${tenantId}/categories`,
        payload
      );
      await deleteCacheKey(ROOM_CATEGORIES_STORE, tenantKey(tenantId, ROOM_CATEGORIES_STORE));
      const mapped = mapCategory(created);
      refreshLocal([...categories, mapped]);
      return mapped;
    },
    [categories, refreshLocal]
  );

  const updateCategory = useCallback(
    async (
      tenantId: string,
      categoryId: string,
      payload: Partial<RoomCategoryMutationPayload>
    ) => {
      const updated = await httpClient.put<any>(
        `api/tenants/${tenantId}/categories/${categoryId}`,
        payload
      );
      await deleteCacheKey(ROOM_CATEGORIES_STORE, tenantKey(tenantId, ROOM_CATEGORIES_STORE));
      const mapped = mapCategory(updated);
      refreshLocal(
        categories.map((item) => (item.id === categoryId ? mapped : item))
      );
      return mapped;
    },
    [categories, refreshLocal]
  );

  const uploadCategoryImages = useCallback(
    async (tenantId: string, categoryId: string, files: File[]) => {
      if (!files.length) {
        throw new Error("Please select at least one image.");
      }
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const updated = await httpClient.post<any>(
        `api/tenants/${tenantId}/categories/${categoryId}/images`,
        formData
      );
      await deleteCacheKey(ROOM_CATEGORIES_STORE, tenantKey(tenantId, ROOM_CATEGORIES_STORE));
      const mapped = mapCategory(updated);
      refreshLocal(
        categories.map((item) => (item.id === categoryId ? mapped : item))
      );
      return mapped;
    },
    [categories, refreshLocal]
  );

  const deleteCategoryImage = useCallback(
    async (tenantId: string, categoryId: string, imageUrl: string) => {
      const encoded = encodeURIComponent(imageUrl);
      const updated = await httpClient.delete<any>(
        `api/tenants/${tenantId}/categories/${categoryId}/images?image_url=${encoded}`
      );
      await deleteCacheKey(ROOM_CATEGORIES_STORE, tenantKey(tenantId, ROOM_CATEGORIES_STORE));
      const mapped = mapCategory(updated);
      refreshLocal(
        categories.map((item) => (item.id === categoryId ? mapped : item))
      );
      return mapped;
    },
    [categories, refreshLocal]
  );

  const deleteCategory = useCallback(
    async (tenantId: string, categoryId: string) => {
      await httpClient.delete(`api/tenants/${tenantId}/categories/${categoryId}`);
      await deleteCacheKey(ROOM_CATEGORIES_STORE, tenantKey(tenantId, ROOM_CATEGORIES_STORE));
      refreshLocal(categories.filter((item) => item.id !== categoryId));
    },
    [categories, refreshLocal]
  );

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    uploadCategoryImages,
    deleteCategoryImage,
    deleteCategory,
  };
}
