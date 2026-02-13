'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuditLog } from '@/domain/entities/AuditLog';
import { repositories } from '@/infrastructure/config/container';

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.auditLogs.getAll();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch audit logs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
