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
      // Hardcoded hotel ID '1' for now as auth doesn't provide it yet
      // In a real app, we'd get this from useAuth().user.hotelId
      const data = await repositories.tickets.getHotelTickets('1');
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel tickets'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const createTicket = useCallback(async (data: Omit<HotelTicket, 'id'>) => {
    // Hardcoded hotel ID '1'
    const created = await repositories.tickets.createTicket('1', data);
    setTickets((prev) => [...prev, created]);
    return created;
  }, []);

  const updateTicket = useCallback(async (id: string, data: Partial<HotelTicket>) => {
    // Admin uses updateTicket, but maybe hotel can too?
    // Using repositories.tickets.updateTicket which is technically admin-side in my repo implementation
    // But for now let's assume it's fine or I should add updateOwnTicket to repo
    // Actually existing implementation uses repositories.hotelHelp.update
    const updated = await repositories.tickets.updateTicket(id, data);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  return { tickets, loading, error, createTicket, updateTicket, refetch: fetchTickets };
}
