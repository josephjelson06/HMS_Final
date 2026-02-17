
import type { IInvoiceRepository } from '../../../domain/contracts/IInvoiceRepository';
import type { Invoice } from '../../../domain/entities/Invoice';
import { httpClient } from '../../http/client';

export class ApiInvoiceRepository implements IInvoiceRepository {
  private baseUrl = 'api/subscriptions/invoices';

  async getAll(): Promise<Invoice[]> {
    console.log("Fetching all invoices from API...");
    const data = await httpClient.get<any[]>(this.baseUrl);
    return data.map(d => ({
      id: d.id, // UUID
      invoiceNumber: d.invoice_number,
      hotel: d.hotel_name || 'Unknown',
      amount: d.amount,
      baseAmount: d.amount, 
      gst: 0,
      total: d.amount,
      status: d.status,
      dueDate: new Date(d.due_date).toLocaleDateString(),
      issuedDate: new Date(d.generated_on).toLocaleDateString(),
      daysOverdue: 0 
    }));
  }

  async getById(id: string): Promise<Invoice | null> {
    try {
        const d = await httpClient.get<any>(`${this.baseUrl}/${id}`);
        return {
          id: d.id,
          invoiceNumber: d.invoice_number,
          hotel: d.hotel_name || 'Unknown',
          amount: d.amount,
          baseAmount: d.amount,
          gst: 0,
          total: d.amount,
          status: d.status,
          dueDate: new Date(d.due_date).toLocaleDateString(),
          issuedDate: new Date(d.generated_on).toLocaleDateString(),
          daysOverdue: 0
        };
    } catch (error) {
        return null;
    }
  }

  async create(data: Omit<Invoice, 'id'>): Promise<Invoice> {
    const payload = {
      hotel_id: (data as any).hotelId || (data as any).hotel_id,
      amount: data.total || data.amount,
      status: data.status || 'Pending',
      period_start: data.period || 'Unknown',
      period_end: data.period || 'Unknown',
      due_date: data.dueDate,
    };

    const result = await httpClient.post<any>(this.baseUrl, payload);
    
    return {
      id: result.id,
      invoiceNumber: result.invoice_number,
      hotel: result.hotel_name || 'Unknown',
      amount: result.amount,
      baseAmount: result.amount,
      gst: 0,
      total: result.amount,
      status: result.status,
      dueDate: result.due_date,
      issuedDate: result.generated_on
    };
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
      const payload: any = {};
      if (data.status) payload.status = data.status;
      if (data.amount !== undefined) payload.amount = data.amount;
      if (data.dueDate) payload.due_date = data.dueDate;

      const result = await httpClient.patch<any>(`${this.baseUrl}/${id}`, payload);
      
      return {
          id: result.id,
          invoiceNumber: result.invoice_number,
          hotel: result.hotel_name || 'Unknown',
          amount: result.amount,
          baseAmount: result.amount,
          gst: 0,
          total: result.amount,
          status: result.status,
          dueDate: result.due_date,
          issuedDate: result.generated_on
      };
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }
}
