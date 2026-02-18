'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DetachedIncident as Incident } from './_detachedTypes';

export type AdminIncident = Incident & { hotelName?: string; hotelId: number };

export function useAdminIncidents() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setIncidents([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  return { incidents, loading, error, refetch: fetchIncidents };
}
