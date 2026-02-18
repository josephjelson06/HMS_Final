import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';
import type { Subscription } from '../../domain/entities/Subscription';
import { httpClient } from '../http/client';
import type {
  ApiInvoiceDTO,
  ApiSubscriptionDTO,
  ApiSubscriptionUpdateDTO,
} from '../dto/backend';

type SubscriptionUpdateInput = Partial<Subscription> & {
  invoiceAmount?: number;
  invoiceStatus?: string;
};

export class ApiSubscriptionRepository implements ISubscriptionRepository {
  private baseUrl = 'api/subscriptions/';

  private mapToEntity(data: ApiSubscriptionDTO): Subscription {
    const nowIso = new Date().toISOString();
    const startDate = data.startDate ?? nowIso;
    const renewalDate = data.renewalDate ?? nowIso;

    return {
      id: String(data.id),
      hotelId: String(data.hotel_id),
      hotel_id: String(data.hotel_id),
      hotel: data.hotel ?? '',
      plan: data.plan,
      startDate,
      renewalDate,
      status: data.status ?? 'Active',
      autoRenew: Boolean(data.autoRenew),
      price: data.price ?? 0,
    };
  }

  private toUpdatePayload(data: SubscriptionUpdateInput): ApiSubscriptionUpdateDTO {
    const payload: ApiSubscriptionUpdateDTO = {};

    if (data.plan !== undefined) payload.plan = String(data.plan);
    if (data.autoRenew !== undefined) payload.is_auto_renew = data.autoRenew;
    if (data.renewalDate !== undefined) payload.subscription_end_date = data.renewalDate;
    if (data.price !== undefined) payload.mrr = data.price;
    if (data.invoiceAmount !== undefined) payload.invoice_amount = data.invoiceAmount;
    if (data.invoiceStatus !== undefined) payload.invoice_status = data.invoiceStatus;

    return payload;
  }

  async getAll(): Promise<Subscription[]> {
    const data = await httpClient.get<ApiSubscriptionDTO[]>(this.baseUrl);
    return data.map((item) => this.mapToEntity(item));
  }

  async getById(id: string): Promise<Subscription | null> {
    const all = await this.getAll();
    return all.find((s) => s.id === id || s.hotel_id === id || s.hotelId === id) || null;
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const payload = this.toUpdatePayload(data as SubscriptionUpdateInput);
    const result = await httpClient.patch<ApiSubscriptionDTO>(`${this.baseUrl}${id}`, payload);
    return this.mapToEntity(result);
  }

  async getInvoices(hotelId: string): Promise<ApiInvoiceDTO[]> {
    return httpClient.get<ApiInvoiceDTO[]>(`${this.baseUrl}invoices/${hotelId}`);
  }
}
