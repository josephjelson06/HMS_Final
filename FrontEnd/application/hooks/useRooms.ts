import { useState, useCallback } from 'react';
import { httpClient } from '../../infrastructure/http/client';

export interface RoomTypeData {
    id: string;
    name: string;
    code: string;
    price: number;
    amenities: string[];
}

export function useRooms() {
    const [rooms, setRooms] = useState<RoomTypeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = useCallback(async (tenantId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await httpClient.get<any[]>(`api/tenants/${tenantId}/rooms`);
            setRooms(
                data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    price: Number(item.price),
                    amenities: item.amenities || [],
                }))
            );
        } catch (err: any) {
            setError(err.message || 'Failed to fetch rooms');
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        rooms,
        loading,
        error,
        fetchRooms,
    };
}
