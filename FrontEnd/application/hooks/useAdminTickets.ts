'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HotelTicket } from '@/domain/entities/HotelTicket';
import { repositories } from '@/infrastructure/config/container';

export function useAdminTickets() {
  const [tickets, setTickets] = useState<HotelTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.tickets.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch admin tickets'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const resolveTicket = useCallback(async (id: string) => {
    try {
      const updated = await repositories.tickets.updateTicket(id, { status: 'Resolved' });
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const closeTicket = useCallback(async (id: string) => {
      try {
        const updated = await repositories.tickets.updateTicket(id, { status: 'Closed' });
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
        return updated;
      } catch (err) {
        throw err;
      }
    }, []);

  return { tickets, loading, error, resolveTicket, closeTicket, refetch: fetchTickets };
}
