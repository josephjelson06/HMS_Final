'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HotelTicket } from '@/domain/entities/HotelTicket';
import { repositories } from '@/infrastructure/config/container';

export function useHotelHelp() {
  const [tickets, setTickets] = useState<HotelTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.hotelHelp.getAll();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel tickets'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const createTicket = useCallback(async (data: Omit<HotelTicket, 'id'>) => {
    const created = await repositories.hotelHelp.create(data);
    setTickets((prev) => [...prev, created]);
    return created;
  }, []);

  const updateTicket = useCallback(async (id: string, data: Partial<HotelTicket>) => {
    const updated = await repositories.hotelHelp.update(id, data);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  return { tickets, loading, error, createTicket, updateTicket, refetch: fetchTickets };
}
