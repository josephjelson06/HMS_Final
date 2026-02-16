import { useState, useEffect, useCallback } from 'react';
import type { BookingBlock, BookingRoom } from '@/domain/entities/Booking';
import { repositories } from '@/infrastructure/config/container';
import { useAuth } from './useAuth';

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingBlock[]>([]);
  const [rooms, setRooms] = useState<BookingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.hotelId) return;
    try {
      setLoading(true);
      const [bookingData, roomData] = await Promise.all([
        repositories.bookings.getAllBookings(user.hotelId),
        repositories.bookings.getAllRooms(user.hotelId),
      ]);
      setBookings(bookingData);
      setRooms(roomData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bookings'));
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createBooking = useCallback(async (data: Omit<BookingBlock, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const created = await repositories.bookings.create(data, user.hotelId);
    setBookings((prev) => [...prev, created]);
    return created;
  }, [user?.hotelId]);

  const updateBooking = useCallback(async (id: string, data: Partial<BookingBlock>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const updated = await repositories.bookings.update(id, data, user.hotelId);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  }, [user?.hotelId]);

  return { bookings, rooms, loading, error, createBooking, updateBooking, refetch: fetchData };
}
