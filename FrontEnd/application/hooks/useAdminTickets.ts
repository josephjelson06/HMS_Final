'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DetachedHotelTicket as HotelTicket } from './_detachedTypes';

export function useAdminTickets() {
  const [tickets, setTickets] = useState<HotelTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setTickets([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const resolveTicket = useCallback(async (id: string) => {
    throw new Error('Ticket data linkage is disabled');
  }, []);

  const closeTicket = useCallback(async (id: string) => {
      throw new Error('Ticket data linkage is disabled');
    }, []);

  return { tickets, loading, error, resolveTicket, closeTicket, refetch: fetchTickets };
}
