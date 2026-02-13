'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BookingBlock, BookingRoom } from '@/domain/entities/Booking';
import { repositories } from '@/infrastructure/config/container';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingBlock[]>([]);
  const [rooms, setRooms] = useState<BookingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingData, roomData] = await Promise.all([
        repositories.bookings.getAllBookings(),
        repositories.bookings.getAllRooms(),
      ]);
      setBookings(bookingData);
      setRooms(roomData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bookings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createBooking = useCallback(async (data: Omit<BookingBlock, 'id'>) => {
    const created = await repositories.bookings.create(data);
    setBookings((prev) => [...prev, created]);
    return created;
  }, []);

  const updateBooking = useCallback(async (id: string, data: Partial<BookingBlock>) => {
    const updated = await repositories.bookings.update(id, data);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  }, []);

  return { bookings, rooms, loading, error, createBooking, updateBooking, refetch: fetchData };
}
