'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DetachedBillingInvoice as BillingInvoice } from './_detachedTypes';

export function useBilling() {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setInvoices([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const createInvoice = useCallback(async (data: Omit<BillingInvoice, 'id'>) => {
    throw new Error('Billing data linkage is disabled');
  }, []);

  const updateInvoice = useCallback(async (id: string, data: Partial<BillingInvoice>) => {
    throw new Error('Billing data linkage is disabled');
  }, []);

  return { invoices, loading, error, createInvoice, updateInvoice, refetch: fetchInvoices };
}
