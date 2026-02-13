import { useState, useEffect } from 'react';
import type { Invoice } from '../../domain/entities/Invoice';
import { repositories } from '../../infrastructure/config/container';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    repositories.invoices.getAll()
      .then(setInvoices)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createInvoice = async (data: Omit<Invoice, 'id'>) => {
    const invoice = await repositories.invoices.create(data);
    setInvoices(prev => [...prev, invoice]);
    return invoice;
  };

  return { invoices, loading, error, createInvoice };
}
