import type { ISubscriptionRepository } from '@/domain/contracts/ISubscriptionRepository';
import type { Subscription } from '@/domain/entities/Subscription';
import { mockSubscriptions } from '@/data/subscriptions';

export class MockSubscriptionRepository implements ISubscriptionRepository {
  async getAll(): Promise<Subscription[]> {
    return mockSubscriptions;
  }

  async getById(id: string): Promise<Subscription | null> {
    return mockSubscriptions.find((s) => s.id === id) ?? null;
  }

  async create(data: Omit<Subscription, 'id'>): Promise<Subscription> {
    return { id: String(Date.now()), ...data };
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const existing = mockSubscriptions.find((s) => s.id === id);
    return { ...(existing ?? mockSubscriptions[0]), ...data } as Subscription;
  }
}
