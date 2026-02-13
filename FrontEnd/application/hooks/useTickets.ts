import { useState, useEffect } from 'react';
import type { Ticket } from '../../domain/entities/Ticket';
import { repositories } from '../../infrastructure/config/container';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    repositories.tickets.getAll()
      .then(setTickets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createTicket = async (data: Omit<Ticket, 'id'>) => {
    const ticket = await repositories.tickets.create(data);
    setTickets(prev => [...prev, ticket]);
    return ticket;
  };

  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    const ticket = await repositories.tickets.update(id, data);
    setTickets(prev => prev.map(t => t.id === id ? ticket : t));
    return ticket;
  };

  return { tickets, loading, error, createTicket, updateTicket };
}
