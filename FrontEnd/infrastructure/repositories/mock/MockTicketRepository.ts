import type { ITicketRepository } from '../../domain/contracts/ITicketRepository';
import type { Ticket } from '../../domain/entities/Ticket';
import { mockTickets } from '../../data/helpdesk';

export class MockTicketRepository implements ITicketRepository {
  private data: Ticket[] = mockTickets.map(t => ({ ...t }));

  async getAll(): Promise<Ticket[]> {
    return this.data;
  }

  async getById(id: string): Promise<Ticket | null> {
    return this.data.find(t => t.id === id) ?? null;
  }

  async create(input: Omit<Ticket, 'id'>): Promise<Ticket> {
    const ticket: Ticket = { id: `TKT-${Date.now()}`, ...input };
    this.data.push(ticket);
    return ticket;
  }

  async update(id: string, input: Partial<Ticket>): Promise<Ticket> {
    const idx = this.data.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Ticket ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    this.data = this.data.filter(t => t.id !== id);
  }
}
