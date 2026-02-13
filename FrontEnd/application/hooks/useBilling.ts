'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BillingInvoice } from '@/domain/entities/BillingInvoice';
import { repositories } from '@/infrastructure/config/container';

export function useBilling() {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repositories.billing.getAll();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch billing'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const createInvoice = useCallback(async (data: Omit<BillingInvoice, 'id'>) => {
    const created = await repositories.billing.create(data);
    setInvoices((prev) => [...prev, created]);
    return created;
  }, []);

  const updateInvoice = useCallback(async (id: string, data: Partial<BillingInvoice>) => {
    const updated = await repositories.billing.update(id, data);
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  return { invoices, loading, error, createInvoice, updateInvoice, refetch: fetchInvoices };
}
