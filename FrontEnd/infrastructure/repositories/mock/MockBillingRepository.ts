import type { IBillingRepository } from '@/domain/contracts/IBillingRepository';
import type { BillingInvoice } from '@/domain/entities/BillingInvoice';
import { mockInvoices } from '@/data/billingHub';

export class MockBillingRepository implements IBillingRepository {
  async getAll(): Promise<BillingInvoice[]> {
    return mockInvoices;
  }

  async getById(id: string): Promise<BillingInvoice | null> {
    return mockInvoices.find((i) => i.id === id) ?? null;
  }

  async create(data: Omit<BillingInvoice, 'id'>): Promise<BillingInvoice> {
    return { id: `INV-H-${Date.now()}`, ...data };
  }

  async update(id: string, data: Partial<BillingInvoice>): Promise<BillingInvoice> {
    const existing = mockInvoices.find((i) => i.id === id);
    return { ...(existing ?? mockInvoices[0]), ...data } as BillingInvoice;
  }

  async delete(_id: string): Promise<void> {
    /* no-op in mock */
  }
}
