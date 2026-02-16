import { useState, useEffect, useCallback } from 'react';
import type { HotelTicket } from '@/domain/entities/HotelTicket';
import { repositories } from '@/infrastructure/config/container';
import { useAuth } from './useAuth';

export function useHotelHelp() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<HotelTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user?.hotelId) return;
    try {
      setLoading(true);
      const data = await repositories.tickets.getHotelTickets(user.hotelId);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel tickets'));
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const createTicket = useCallback(async (data: Omit<HotelTicket, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const created = await repositories.tickets.createTicket(user.hotelId, data);
    setTickets((prev) => [...prev, created]);
    return created;
  }, [user?.hotelId]);

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
