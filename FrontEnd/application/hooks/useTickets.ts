import { useState, useEffect } from 'react';
import type { DetachedTicket as Ticket } from './_detachedTypes';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setTickets([]);
    setError(null);
    setLoading(false);
  }, []);

  const createTicket = async (data: Omit<Ticket, 'id'>) => {
    throw new Error('Ticket data linkage is disabled');
  };

  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    throw new Error('Ticket data linkage is disabled');
  };

  return { tickets, loading, error, createTicket, updateTicket };
}
