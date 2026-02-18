'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DetachedHotelAuditLog as HotelAuditLog } from './_detachedTypes';

export function useHotelAudit() {
  const [logs, setLogs] = useState<HotelAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setLogs([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
