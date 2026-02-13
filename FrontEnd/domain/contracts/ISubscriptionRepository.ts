import type { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  getAll(): Promise<Subscription[]>;
  getById(id: string): Promise<Subscription | null>;
  create(data: Omit<Subscription, 'id'>): Promise<Subscription>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
}
