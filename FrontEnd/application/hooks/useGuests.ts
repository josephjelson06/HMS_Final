'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Guest } from '@/domain/entities/Guest';
import { repositories } from '@/infrastructure/config/container';

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.guests.getAll();
      setGuests(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch guests'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const createGuest = useCallback(async (data: Omit<Guest, 'id'>) => {
    const created = await repositories.guests.create(data);
    setGuests((prev) => [...prev, created]);
    return created;
  }, []);

  const updateGuest = useCallback(async (id: string, data: Partial<Guest>) => {
    const updated = await repositories.guests.update(id, data);
    setGuests((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  return { guests, loading, error, createGuest, updateGuest, refetch: fetchGuests };
}
