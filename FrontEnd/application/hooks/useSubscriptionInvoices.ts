
import { useState, useEffect, useCallback } from 'react';
import { repositories } from '@/infrastructure/config/container';

export interface Invoice {
  id: string;
  hotel_id: string;
  amount: number;
  status: 'Paid' | 'Overdue' | 'Pending';
  period_start: string;
  period_end: string;
  generated_on: string;
  due_date: string;
}

export function useSubscriptionInvoices(hotelId: string | undefined) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!hotelId) return;
    try {
      setLoading(true);
      const data = await repositories.subscriptions.getInvoices(hotelId);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refetch: fetchInvoices };
}
