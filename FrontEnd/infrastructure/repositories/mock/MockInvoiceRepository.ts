import type { IInvoiceRepository } from '../../domain/contracts/IInvoiceRepository';
import type { Invoice } from '../../domain/entities/Invoice';
import { INITIAL_INVOICES } from '../../data/invoices';

export class MockInvoiceRepository implements IInvoiceRepository {
  private data: Invoice[] = INITIAL_INVOICES.map(i => ({ ...i }));

  async getAll(): Promise<Invoice[]> {
    return this.data;
  }

  async getById(id: string): Promise<Invoice | null> {
    return this.data.find(i => i.id === id) ?? null;
  }

  async create(input: Omit<Invoice, 'id'>): Promise<Invoice> {
    const invoice: Invoice = { id: `ATC-INV-${Date.now()}`, ...input };
    this.data.push(invoice);
    return invoice;
  }

  async update(id: string, input: Partial<Invoice>): Promise<Invoice> {
    const idx = this.data.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Invoice ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    this.data = this.data.filter(i => i.id !== id);
  }
}
