import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';
import type { Subscription } from '../../domain/entities/Subscription';
import { httpClient } from '../http/client';
import type { ApiSubscriptionDTO } from '../dto/backend';
import {
  deleteCacheKey,
  globalKey,
  getCached,
  setCached,
  tenantKey,
} from '../storage/idbClient';

const SUBSCRIPTIONS_STORE = 'subscriptions';

export class ApiSubscriptionRepository implements ISubscriptionRepository {
  private mapToEntity(data: ApiSubscriptionDTO): Subscription {
    return {
      id: String(data.id),
      tenantId: data.tenant_id ? String(data.tenant_id) : '',
      planId: data.plan_id ? String(data.plan_id) : undefined,
      startDate: data.start_date ?? undefined,
      endDate: data.end_date ?? undefined,
      status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : 'Active',
    };
  }

  async getAll(): Promise<Subscription[]> {
    const key = globalKey('subscriptions', 'list');
    const cached = await getCached<Subscription[]>(SUBSCRIPTIONS_STORE, key);
    if (cached) {
      return cached;
    }

    // Backward-compat: key used without suffix in older local experiments.
    const oldKeyCached = await getCached<Subscription[]>(SUBSCRIPTIONS_STORE, globalKey('subscriptions'));
    if (oldKeyCached) {
      await setCached(SUBSCRIPTIONS_STORE, key, oldKeyCached);
      return oldKeyCached;
    }

    // Backward-compat: migrate from old settings-store cache key if present.
    const legacy = await getCached<Subscription[]>('settings', globalKey('settings', 'subscriptions'));
    if (legacy) {
      await setCached(SUBSCRIPTIONS_STORE, key, legacy);
      return legacy;
    }

    const data = await httpClient.get<ApiSubscriptionDTO[]>('api/subscriptions');
    const mapped = data.map((item) => this.mapToEntity(item));
    await setCached(SUBSCRIPTIONS_STORE, key, mapped);
    return mapped;
  }

  async getByTenantId(tenantId: string): Promise<Subscription | null> {
    const key = tenantKey(tenantId, 'subscriptions', 'current');
    const cached = await getCached<Subscription>(SUBSCRIPTIONS_STORE, key);
    if (cached) {
      return cached;
    }

    // Backward-compat: key used without suffix in older local experiments.
    const oldKeyCached = await getCached<Subscription>(
      SUBSCRIPTIONS_STORE,
      tenantKey(tenantId, 'subscriptions'),
    );
    if (oldKeyCached) {
      await setCached(SUBSCRIPTIONS_STORE, key, oldKeyCached);
      return oldKeyCached;
    }

    // Backward-compat: migrate from old settings-store cache key if present.
    const legacy = await getCached<Subscription>(
      'settings',
      tenantKey(tenantId, 'settings', 'subscription'),
    );
    if (legacy) {
      await setCached(SUBSCRIPTIONS_STORE, key, legacy);
      return legacy;
    }

    try {
      const data = await httpClient.get<ApiSubscriptionDTO>(`api/hotels/${tenantId}/subscription`);
      const mapped = this.mapToEntity(data);
      await setCached(SUBSCRIPTIONS_STORE, key, mapped);
      return mapped;
    } catch {
      return null;
    }
  }

  async getById(id: string): Promise<Subscription | null> {
    // If we have an endpoint for single sub by ID
    try {
      const result = await httpClient.get<ApiSubscriptionDTO>(`api/subscriptions/${id}`);
      return this.mapToEntity(result);
    } catch {
      return null;
    }
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const payload: any = {};
    if (data.planId !== undefined) payload.plan_id = data.planId;
    if (data.status !== undefined) payload.status = data.status;
    if (data.endDate !== undefined) payload.end_date = data.endDate;

    const result = await httpClient.patch<ApiSubscriptionDTO>(`api/subscriptions/${id}`, payload);
    const mapped = this.mapToEntity(result);

    await deleteCacheKey(SUBSCRIPTIONS_STORE, globalKey('subscriptions', 'list'));
    if (mapped.tenantId) {
      await deleteCacheKey(
        SUBSCRIPTIONS_STORE,
        tenantKey(mapped.tenantId, 'subscriptions', 'current'),
      );
    }
    // Also clear legacy keys.
    await deleteCacheKey('settings', globalKey('settings', 'subscriptions'));
    if (mapped.tenantId) {
      await deleteCacheKey('settings', tenantKey(mapped.tenantId, 'settings', 'subscription'));
    }
    return mapped;
  }
}
