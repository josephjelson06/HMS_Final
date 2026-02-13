import type { IGuestRepository } from '@/domain/contracts/IGuestRepository';
import type { Guest } from '@/domain/entities/Guest';
import { mockGuests } from '@/data/guests';

export class MockGuestRepository implements IGuestRepository {
  async getAll(): Promise<Guest[]> {
    return mockGuests;
  }

  async getById(id: string): Promise<Guest | null> {
    return mockGuests.find((g) => g.id === id) ?? null;
  }

  async create(data: Omit<Guest, 'id'>): Promise<Guest> {
    return { id: String(Date.now()), ...data };
  }

  async update(id: string, data: Partial<Guest>): Promise<Guest> {
    const existing = mockGuests.find((g) => g.id === id);
    return { ...(existing ?? mockGuests[0]), ...data } as Guest;
  }

  async delete(_id: string): Promise<void> {
    /* no-op in mock */
  }
}
