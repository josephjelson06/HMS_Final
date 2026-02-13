'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HotelAuditLog } from '@/domain/entities/HotelAuditLog';
import { repositories } from '@/infrastructure/config/container';

export function useHotelAudit() {
  const [logs, setLogs] = useState<HotelAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.hotelAudit.getAll();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel audit logs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
