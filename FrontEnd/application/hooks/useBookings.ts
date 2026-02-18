import { useState, useEffect, useCallback } from 'react';
import type { DetachedBookingBlock as BookingBlock, DetachedBookingRoom as BookingRoom } from './_detachedTypes';
import { useAuth } from './useAuth';

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingBlock[]>([]);
  const [rooms, setRooms] = useState<BookingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setBookings([]);
    setRooms([]);
    setError(null);
    setLoading(false);
  }, [user?.hotelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createBooking = useCallback(async (data: Omit<BookingBlock, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Booking data linkage is disabled');
  }, [user?.hotelId]);

  const updateBooking = useCallback(async (id: string, data: Partial<BookingBlock>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Booking data linkage is disabled');
  }, [user?.hotelId]);

  return { bookings, rooms, loading, error, createBooking, updateBooking, refetch: fetchData };
}
