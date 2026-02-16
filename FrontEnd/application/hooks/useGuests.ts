'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Guest } from '@/domain/entities/Guest';
import { repositories } from '@/infrastructure/config/container';
import { useAuth } from './useAuth';

export function useGuests() {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGuests = useCallback(async () => {
    if (!user?.hotelId) return;
    try {
      setLoading(true);
      const data = await repositories.guests.getAll(user.hotelId);
      setGuests(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch guests'));
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const createGuest = useCallback(async (data: Omit<Guest, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const created = await repositories.guests.create(data, user.hotelId);
    setGuests((prev) => [...prev, created]);
    return created;
  }, [user?.hotelId]);

  const updateGuest = useCallback(async (id: string, data: Partial<Guest>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const updated = await repositories.guests.update(id, data, user.hotelId);
    setGuests((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, [user?.hotelId]);

  return { guests, loading, error, createGuest, updateGuest, refetch: fetchGuests };
}
