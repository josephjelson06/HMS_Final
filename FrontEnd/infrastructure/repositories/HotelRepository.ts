import type { IHotelRepository } from '../../domain/contracts/IHotelRepository';
import type { Hotel } from '../../domain/entities/Hotel';
import { httpClient } from '../http/client';
import type { ApiHotelDTO } from '../dto/backend';

export class ApiHotelRepository implements IHotelRepository {
  private baseUrl = 'api/hotels/';

  private mapToEntity(data: ApiHotelDTO): Hotel {
    return {
      id: String(data.id),
      name: data.name ?? '',
      gstin: data.gstin ?? undefined,
      owner: data.owner ?? undefined,
      email: data.email ?? undefined,
      mobile: data.mobile ?? undefined,
      plan: data.plan ?? undefined,
      kiosks: data.kiosks ?? 0,
      status: data.status ?? 'Onboarding',
      mrr: data.mrr ?? 0,
      address: data.address ?? undefined,
      pan: data.pan ?? undefined,
      legal_name: data.legal_name ?? undefined,
      logo: data.logo ?? undefined,
      kiosk_list: data.kiosk_list ?? undefined,
    };
  }

  private toCreatePayload(data: Omit<Hotel, 'id'> & { kiosks_details?: { serial_number: string; location: string }[] }): Record<string, unknown> {
    return {
      name: data.name,
      gstin: data.gstin,
      owner: data.owner,
      email: data.email,
      mobile: data.mobile,
      pan: data.pan,
      legal_name: data.legal_name,
      logo: data.logo,
      address: data.address,
      plan: data.plan,
      kiosks: data.kiosks,
      status: data.status,
      mrr: data.mrr,
      kiosk_list: data.kiosk_list,
      kiosks_details: data.kiosks_details,
    };
  }

  private toUpdatePayload(data: Partial<Hotel>): Record<string, unknown> {
    return {
      name: data.name,
      gstin: data.gstin,
      owner: data.owner,
      email: data.email,
      mobile: data.mobile,
      pan: data.pan,
      legal_name: data.legal_name,
      logo: data.logo,
      address: data.address,
      plan: data.plan,
      kiosks: data.kiosks,
      status: data.status,
      mrr: data.mrr,
      kiosk_list: data.kiosk_list,
    };
  }

  async getAll(): Promise<Hotel[]> {
    const result = await httpClient.get<ApiHotelDTO[]>(this.baseUrl);
    return result.map((item) => this.mapToEntity(item));
  }

  async getById(id: string): Promise<Hotel | null> {
    try {
      const result = await httpClient.get<ApiHotelDTO>(`${this.baseUrl}${id}`);
      return this.mapToEntity(result);
    } catch (error) {
      // If 404, return null as per contract
      return null;
    }
  }

  async create(data: Omit<Hotel, 'id'> & { kiosks_details?: { serial_number: string, location: string }[] }): Promise<Hotel> {
    const payload = this.toCreatePayload(data);
    const result = await httpClient.post<ApiHotelDTO>(this.baseUrl, payload);
    return this.mapToEntity(result);
  }

  async update(id: string, data: Partial<Hotel>): Promise<Hotel> {
    const payload = this.toUpdatePayload(data);
    const result = await httpClient.patch<ApiHotelDTO>(`${this.baseUrl}${id}`, payload);
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${id}`);
  }

  async search(query: string): Promise<Hotel[]> {
    // Assuming backend supports ?q= search, otherwise filter client side or adjust endpoint
    const result = await httpClient.get<ApiHotelDTO[]>(`${this.baseUrl}?q=${encodeURIComponent(query)}`);
    return result.map((item) => this.mapToEntity(item));
  }
}
