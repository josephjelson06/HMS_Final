import { useState, useEffect, useCallback } from 'react';
import type { Incident } from '@/domain/entities/Incident';
import { repositories } from '@/infrastructure/config/container';
import { useAuth } from './useAuth';

export function useIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (!user?.hotelId) return;
    try {
      setLoading(true);
      const data = await repositories.incidents.getAll(user.hotelId);
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch incidents'));
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const createIncident = useCallback(async (data: Omit<Incident, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const created = await repositories.incidents.create(data, user.hotelId);
    setIncidents((prev) => [...prev, created]);
    return created;
  }, [user?.hotelId]);

  const updateIncident = useCallback(async (id: string, data: Partial<Incident>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const updated = await repositories.incidents.update(id, data, user.hotelId);
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, [user?.hotelId]);

  return { incidents, loading, error, createIncident, updateIncident, refetch: fetchIncidents };
}
