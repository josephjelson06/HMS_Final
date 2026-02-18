
import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';
import type { Subscription } from '../../domain/entities/Subscription';
import { httpClient } from '../http/client';

export class ApiSubscriptionRepository implements ISubscriptionRepository {
  private baseUrl = 'api/subscriptions/';

  async getAll(): Promise<Subscription[]> {
    return httpClient.get<Subscription[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Subscription | null> {
    // Current API doesn't have getById specific for subscription, but we can filter or add endpoint
    // validating against getAll for now as per contract or just returning null if not needed strictly
    // Or better, define getById in router if needed. 
    // For now, let's implement getAll.
    const all = await this.getAll();
    return all.find(s => s.id === id) || null;
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    // We map subscription update to our patch endpoint
    // The endpoint expects { plan?, is_auto_renew?, subscription_end_date?, mrr? }
    
    // We need to map 'autoRenew' to 'is_auto_renew' etc.
    const payload: any = {};
    if (data.plan) payload.plan = data.plan;
    if (data.autoRenew !== undefined) payload.is_auto_renew = data.autoRenew;
    if (data.renewalDate) payload.subscription_end_date = data.renewalDate;
    if (data.price) payload.mrr = data.price;
    
    // Check for invoice data (casted from frontend extras)
    if ((data as any).invoiceAmount) payload.invoice_amount = (data as any).invoiceAmount;
    if ((data as any).invoiceStatus) payload.invoice_status = (data as any).invoiceStatus;

    // id here is hotel_id string
    console.log(`Sending PATCH request to ${this.baseUrl}${id} with payload:`, payload);
    const result = await httpClient.patch<Subscription>(`${this.baseUrl}${id}`, payload);
    console.log(`PATCH Response for ${id}:`, result);
    return result;
  }

  async getInvoices(hotelId: string): Promise<any[]> {
    return httpClient.get<any[]>(`${this.baseUrl}invoices/${hotelId}`);
  }
}
