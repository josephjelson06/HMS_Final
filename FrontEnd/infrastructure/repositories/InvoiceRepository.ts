import type { IInvoiceRepository } from '../../domain/contracts/IInvoiceRepository';
import type { Invoice } from '../../domain/entities/Invoice';
import { httpClient } from '../http/client';
import type { ApiInvoiceDTO } from '../dto/backend';

type InvoiceCreatePayload = {
  hotel_id: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  due_date: string;
};

type InvoiceUpdatePayload = {
  status?: string;
  amount?: number;
  due_date?: string;
};

export class ApiInvoiceRepository implements IInvoiceRepository {
  private baseUrl = 'api/subscriptions/invoices';

  private toDisplayDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  }

  private toStatus(status: string | null | undefined): Invoice['status'] {
    if (!status) return 'Pending';
    return status;
  }

  private computeDaysOverdue(status: string | null | undefined, dueDate: string): number {
    const normalized = (status ?? '').toLowerCase();
    if (normalized === 'paid') return 0;

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return 0;

    const diffMs = Date.now() - due.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  private mapToEntity(data: ApiInvoiceDTO): Invoice {
    const amount = data.amount ?? 0;
    const status = this.toStatus(data.status);

    return {
      id: String(data.id),
      invoiceNumber: data.invoice_number ?? undefined,
      invoice_number: data.invoice_number ?? undefined,
      hotel: data.hotel_name ?? 'Unknown',
      hotel_id: String(data.hotel_id),
      hotel_name: data.hotel_name ?? undefined,
      amount,
      baseAmount: amount,
      gst: 0,
      total: amount,
      period_start: data.period_start,
      period_end: data.period_end,
      period: `${data.period_start} - ${data.period_end}`,
      status,
      dueDate: this.toDisplayDate(data.due_date),
      due_date: data.due_date,
      issuedDate: this.toDisplayDate(data.generated_on),
      generated_on: data.generated_on ?? undefined,
      daysOverdue: this.computeDaysOverdue(data.status, data.due_date),
    };
  }

  private toCreatePayload(data: Omit<Invoice, 'id'>): InvoiceCreatePayload {
    const hotelId = (
      (data as Omit<Invoice, 'id'> & { hotelId?: string }).hotelId ??
      data.hotel_id
    );
    if (!hotelId) {
      throw new Error('hotel_id is required to create invoice.');
    }

    const amount = data.total ?? data.amount ?? 0;
    const periodStart = data.period_start ?? data.period ?? new Date().toISOString();
    const periodEnd = data.period_end ?? data.period ?? periodStart;
    const dueDate = data.due_date ?? data.dueDate;

    return {
      hotel_id: hotelId,
      amount,
      status: data.status ?? 'Pending',
      period_start: periodStart,
      period_end: periodEnd,
      due_date: dueDate,
    };
  }

  private toUpdatePayload(data: Partial<Invoice>): InvoiceUpdatePayload {
    const payload: InvoiceUpdatePayload = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.total !== undefined && payload.amount === undefined) payload.amount = data.total;
    if (data.due_date !== undefined || data.dueDate !== undefined) {
      payload.due_date = data.due_date ?? data.dueDate;
    }
    return payload;
  }

  async getAll(): Promise<Invoice[]> {
    const data = await httpClient.get<ApiInvoiceDTO[]>(this.baseUrl);
    return data.map((item) => this.mapToEntity(item));
  }

  async getById(id: string): Promise<Invoice | null> {
    try {
      const data = await httpClient.get<ApiInvoiceDTO>(`${this.baseUrl}/by-id/${id}`);
      return this.mapToEntity(data);
    } catch (_error) {
      return null;
    }
  }

  async create(data: Omit<Invoice, 'id'>): Promise<Invoice> {
    const payload = this.toCreatePayload(data);
    const result = await httpClient.post<ApiInvoiceDTO>(this.baseUrl, payload);
    return this.mapToEntity(result);
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const payload = this.toUpdatePayload(data);
    const result = await httpClient.patch<ApiInvoiceDTO>(`${this.baseUrl}/${id}`, payload);
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }
}
