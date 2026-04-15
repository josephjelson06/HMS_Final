import { useState, useCallback } from 'react';
import type { Subscription } from '../../domain/entities/Subscription';
import { repositories } from '../../infrastructure/config/container';

export function useSubscriptions(tenantId?: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tenantSubscription, setTenantSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      if (tenantId) {
        const data = await repositories.subscriptions.getByTenantId(tenantId);
        setTenantSubscription(data);
        setSubscriptions(data ? [data] : []);
      } else {
        const data = await repositories.subscriptions.getAll();
        setSubscriptions(data);
      }
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const updateSubscription = useCallback(async (id: string, data: Partial<Subscription>) => {
    setLoading(true);
    try {
      await repositories.subscriptions.update(id, data);
      await fetchSubscriptions();
    } catch (err) {
      setError('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  }, [fetchSubscriptions]);

  return { subscriptions, tenantSubscription, loading, error, fetchSubscriptions, updateSubscription };
}
