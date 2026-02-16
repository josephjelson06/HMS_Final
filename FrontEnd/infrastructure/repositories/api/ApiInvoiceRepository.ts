
import type { IInvoiceRepository } from '../../../domain/contracts/IInvoiceRepository';
import type { Invoice } from '../../../domain/entities/Invoice';
import { httpClient } from '../../http/client';

export class ApiInvoiceRepository implements IInvoiceRepository {
  private baseUrl = 'api/subscriptions/invoices';

  async getAll(): Promise<Invoice[]> {
    console.log("Fetching all invoices from API...");
    const data = await httpClient.get<any[]>(this.baseUrl);
    return data.map(d => ({
      id: d.invoice_number || `INV-${String(d.id).padStart(4, '0')}`, 
      numericId: d.id,
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
    const all = await this.getAll();
    return all.find(i => i.id === id) || null;
  }

  async create(data: Omit<Invoice, 'id'>): Promise<Invoice> {
    console.log("Creating manual invoice via API...", data);
    
    // Map frontend entity to backend schema
    const payload = {
      hotel_id: (data as any).hotelId || (data as any).hotel_id, // ensure we have hotel_id
      amount: data.total || data.amount,
      status: data.status || 'Pending',
      period_start: data.period || 'Unknown',
      period_end: data.period || 'Unknown',
      due_date: data.dueDate,
    };

    console.log("Invoice creation payload:", payload);
    const result = await httpClient.post<any>(this.baseUrl, payload);
    
    return {
      id: result.invoice_number || `INV-${String(result.id).padStart(4, '0')}`,
      numericId: result.id,
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
      console.log(`Updating invoice ${id}`, data);
      
      // We need the numeric ID. If data.numericId is not there, we find it.
      let numericId = (data as any).numericId;
      if (!numericId) {
          const inv = await this.getById(id);
          numericId = inv?.numericId;
      }

      if (!numericId) {
          // Fallback: try to parse from ID string e.g. INV-2026-0001
          const parts = id.split('-');
          const lastPart = parts[parts.length - 1];
          numericId = parseInt(lastPart);
      }

      console.log(`Numeric ID for update: ${numericId}`);
      
      const payload: any = {};
      if (data.status) payload.status = data.status;
      if (data.amount !== undefined) payload.amount = data.amount;
      if (data.dueDate) payload.due_date = data.dueDate;

      const result = await httpClient.patch<any>(`${this.baseUrl}/${numericId}`, payload);
      
      // Map back to entity
      return {
          id: result.invoice_number || `INV-${String(result.id).padStart(4, '0')}`,
          numericId: result.id,
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
      throw new Error("Method not implemented.");
  }
}
