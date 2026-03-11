import type { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  getAll(): Promise<Subscription[]>;
  getByTenantId(tenantId: string): Promise<Subscription | null>;
  getById(id: string): Promise<Subscription | null>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
}
