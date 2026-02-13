import type { BillingInvoice } from '../entities/BillingInvoice';

export interface IBillingRepository {
  getAll(): Promise<BillingInvoice[]>;
  getById(id: string): Promise<BillingInvoice | null>;
  create(data: Omit<BillingInvoice, 'id'>): Promise<BillingInvoice>;
  update(id: string, data: Partial<BillingInvoice>): Promise<BillingInvoice>;
  delete(id: string): Promise<void>;
}
