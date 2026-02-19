import { useState, useCallback } from 'react';
import type { Subscription } from '../../domain/entities/Subscription';
import { repositories } from '../../infrastructure/config/container';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repositories.subscriptions.getAll();
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscriptions, loading, error, fetchSubscriptions };
}
