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
    price: number;
    amenities: string[];
}

const ROOM_TYPES_STORE = 'roomTypes';
const ROOM_TYPES_TTL_MS = 10 * 60 * 1000;

type RoomTypeMutationPayload = Partial<Omit<RoomTypeData, 'id'>> & {
    id?: string;
};

function mapRoom(item: any): RoomTypeData {
    return {
        id: String(item.id),
        name: item.name,
        code: item.code,
        price: Number(item.price),
        amenities: item.amenities || [],
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

    const createRoomType = useCallback(async (tenantId: string, payload: RoomTypeMutationPayload) => {
        const created = await httpClient.post<any>(`api/tenants/${tenantId}/rooms`, payload);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
        return mapRoom(created);
    }, []);

    const updateRoomType = useCallback(async (tenantId: string, roomTypeId: string, payload: RoomTypeMutationPayload) => {
        const updated = await httpClient.put<any>(`api/tenants/${tenantId}/rooms/${roomTypeId}`, payload);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
        return mapRoom(updated);
    }, []);

    const deleteRoomType = useCallback(async (tenantId: string, roomTypeId: string) => {
        await httpClient.delete(`api/tenants/${tenantId}/rooms/${roomTypeId}`);
        await deleteCacheKey(ROOM_TYPES_STORE, tenantKey(tenantId, ROOM_TYPES_STORE));
    }, []);

    return {
        rooms,
        loading,
        error,
        fetchRooms,
        createRoomType,
        updateRoomType,
        deleteRoomType,
    };
}
