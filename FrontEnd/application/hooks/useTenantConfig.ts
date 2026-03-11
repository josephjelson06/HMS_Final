import { useCallback, useState } from 'react';
import type { TenantConfig } from '../../domain/entities/TenantConfig';
import { repositories } from '../../infrastructure/config/container';

export function useTenantConfig(tenantId?: string) {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantConfig = useCallback(async () => {
    if (!tenantId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.settings.getTenantConfig(tenantId);
      setConfig(data);
      return data;
    } catch {
      setError('Failed to load tenant config');
      setConfig(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  return { config, loading, error, fetchTenantConfig };
}

