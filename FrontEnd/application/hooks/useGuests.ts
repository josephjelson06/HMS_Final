import { useState, useCallback } from 'react';
import { httpClient } from '../../infrastructure/http/client';

export interface BookingData {
    id: string;
    tenantId: string;
    roomTypeId: string;
    guestName: string;
    status: string;
    adults: number;
    children: number;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    totalPrice: number | null;
    createdAt: string;
}

export function useGuests() {
    const [guests, setGuests] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGuests = useCallback(async (tenantId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await httpClient.get<any[]>(`api/tenants/${tenantId}/bookings`);
            setGuests(
                data.map((item) => ({
                    id: item.id,
                    tenantId: item.tenant_id,
                    roomTypeId: item.room_type_id,
                    guestName: item.guest_name,
                    status: item.status,
                    adults: item.adults,
                    children: item.children || 0,
                    checkInDate: item.check_in_date,
                    checkOutDate: item.check_out_date,
                    nights: item.nights,
                    totalPrice: item.total_price ? Number(item.total_price) : null,
                    createdAt: item.created_at,
                }))
            );
        } catch (err: any) {
            setError(err.message || 'Failed to fetch guests');
            setGuests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        guests,
        loading,
        error,
        fetchGuests,
    };
}
