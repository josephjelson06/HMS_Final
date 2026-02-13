import type { Invoice } from '../entities/Invoice';

export interface IInvoiceRepository {
  getAll(): Promise<Invoice[]>;
  getById(id: string): Promise<Invoice | null>;
  create(data: Omit<Invoice, 'id'>): Promise<Invoice>;
  update(id: string, data: Partial<Invoice>): Promise<Invoice>;
  delete(id: string): Promise<void>;
}
