'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Incident } from '@/domain/entities/Incident';
import { repositories } from '@/infrastructure/config/container';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.incidents.getAll();
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch incidents'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const createIncident = useCallback(async (data: Omit<Incident, 'id'>) => {
    const created = await repositories.incidents.create(data);
    setIncidents((prev) => [...prev, created]);
    return created;
  }, []);

  const updateIncident = useCallback(async (id: string, data: Partial<Incident>) => {
    const updated = await repositories.incidents.update(id, data);
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  return { incidents, loading, error, createIncident, updateIncident, refetch: fetchIncidents };
}
