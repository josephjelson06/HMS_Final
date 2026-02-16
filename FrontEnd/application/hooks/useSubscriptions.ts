'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Subscription } from '@/domain/entities/Subscription';
import { repositories } from '@/infrastructure/config/container';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.subscriptions.getAll();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscriptions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const updateSubscription = useCallback(async (id: string, data: Partial<Subscription>) => {
    console.log(`Hook: Updating subscription ${id}`, data);
    const updated = await repositories.subscriptions.update(id, data);
    console.log(`Hook: Update complete for ${id}, updating local state...`);
    setSubscriptions((prev) => {
      const newState = prev.map((s) => (s.id === id ? updated : s));
      console.log(`Hook: New state count: ${newState.length}`);
      return newState;
    });
    return updated;
  }, []);

  return { subscriptions, loading, error, updateSubscription, refetch: fetchSubscriptions };
}
