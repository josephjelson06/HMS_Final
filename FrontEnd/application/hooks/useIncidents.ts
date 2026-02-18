import { useState, useEffect, useCallback } from 'react';
import type { DetachedIncident as Incident } from './_detachedTypes';
import { useAuth } from './useAuth';

export function useIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setIncidents([]);
    setError(null);
    setLoading(false);
  }, [user?.hotelId]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const createIncident = useCallback(async (data: Omit<Incident, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Incident data linkage is disabled');
  }, [user?.hotelId]);

  const updateIncident = useCallback(async (id: string, data: Partial<Incident>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Incident data linkage is disabled');
  }, [user?.hotelId]);

  return { incidents, loading, error, createIncident, updateIncident, refetch: fetchIncidents };
}
