import type { Ticket } from '../entities/Ticket';

export interface ITicketRepository {
  getAll(): Promise<Ticket[]>;
  getById(id: string): Promise<Ticket | null>;
  create(data: Omit<Ticket, 'id'>): Promise<Ticket>;
  update(id: string, data: Partial<Ticket>): Promise<Ticket>;
  delete(id: string): Promise<void>;
}
