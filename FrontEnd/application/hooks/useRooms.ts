import { useState, useCallback } from 'react';
import { httpClient } from '../../infrastructure/http/client';
import {
    deleteCacheKey,
    getCachedFresh,
    setCached,
    tenantKey,
} from '../../infrastructure/storage/idbClient';

export interface RoomTypeData {
    id: string;
    name: string;
    code: string;
    categoryId: string | null;
    category: RoomCategorySummary | null;
    price: number;
    maxAdults: number;
    maxChildren: number;
    amenities: string[];
    imageUrls: string[];
    images: RoomImageData[];
}

export interface RoomImageData {
    id: string;
    url: string;
    displayOrder: number;
    caption: string | null;
    tags: string[];
    category: string | null;
    isPrimary: boolean;
}

export interface RoomCategorySummary {
    id: string;
    tenantId?: string;
    name: string;
    description: string | null;
    imageUrls: string[];
    displayOrder: number;
}

const ROOM_TYPES_STORE = 'roomTypes';
const ROOM_TYPES_TTL_MS = 10 * 60 * 1000;

type RoomTypeMutationPayload = Partial<Omit<RoomTypeData, 'id'>> & {
    id?: string;
};

function mapRoom(item: any): RoomTypeData {
    const images = Array.isArray(item.images)
        ? item.images.map((image: any, index: number) => ({
            id: String(image.id),
            url: image.url,
            displayOrder: Number(image.display_order ?? image.displayOrder ?? index),
            caption: image.caption ?? null,
            tags: Array.isArray(image.tags) ? image.tags : [],
            category: image.category ?? null,
            isPrimary: Boolean(image.is_primary ?? image.isPrimary),
        }))
        : [];

    return {
        id: String(item.id),
        name: item.name,
        code: item.code,
        categoryId: item.category_id ?? item.categoryId ?? null,
        category: item.category
            ? {
                id: String(item.category.id),
                tenantId: item.category.tenant_id ?? item.category.tenantId,
                name: item.category.name,
                description: item.category.description ?? null,
                imageUrls: Array.isArray(item.category.image_urls)
                    ? item.category.image_urls.filter(Boolean)
                    : Array.isArray(item.category.imageUrls)
                    ? item.category.imageUrls.filter(Boolean)
                    : [],
                displayOrder: Number(
                    item.category.display_order ?? item.category.displayOrder ?? 0
                ),
            }
            : null,
        price: Number(item.price),
        maxAdults: Number(item.max_adults ?? item.maxAdults ?? 2),
        maxChildren: Number(
            item.max_children ?? item.max_childeren ?? item.maxChildren ?? 0
        ),
        amenities: item.amenities || [],
        imageUrls: item.image_urls || item.imageUrls || images.map((image) => image.url),
        images,
    };
}

export function useRooms() {
    const [rooms, setRooms] = useState<RoomTypeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = useCallback(async (tenantId: string) => {
        const key = tenantKey(tenantId, ROOM_TYPES_STORE);
        setLoading(true);
        setError(null);
        try {
            const cached = await getCachedFresh<RoomTypeData[]>(ROOM_TYPES_STORE, key, {
                ttlMs: ROOM_TYPES_TTL_MS,
                deleteIfStale: true,
            });
            if (cached) {
                setRooms(cached);
                return;
            }

            const data = await httpClient.get<any[]>(`api/tenants/${tenantId}/rooms`);
            const mapped = data.map(mapRoom);
            await setCached(ROOM_TYPES_STORE, key, mapped);
            setRooms(mapped);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch rooms');
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createRoomType = useCallback(async (tenantId: string, payload: FormData) => {
        const created = await httpClient.post<any>(`api/tenants/${tenantId}/rooms`, payload);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
        return mapRoom(created);
    }, []);

    const updateRoomType = useCallback(async (tenantId: string, roomTypeId: string, payload: FormData) => {
        const updated = await httpClient.put<any>(`api/tenants/${tenantId}/rooms/${roomTypeId}`, payload);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
        return mapRoom(updated);
    }, []);

    const deleteRoomType = useCallback(async (tenantId: string, roomTypeId: string) => {
        await httpClient.delete(`api/tenants/${tenantId}/rooms/${roomTypeId}`);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
    }, []);

    const deleteRoomImage = useCallback(async (tenantId: string, roomTypeId: string, imageId: string) => {
        const updated = await httpClient.delete<any>(`api/tenants/${tenantId}/rooms/${roomTypeId}/images/${imageId}`);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
        return mapRoom(updated);
    }, []);

    return {
        rooms,
        loading,
        error,
        fetchRooms,
        createRoomType,
        updateRoomType,
        deleteRoomType,
        deleteRoomImage,
    };
}
