import type { IHotelRepository } from '../../../domain/contracts/IHotelRepository';
import type { Hotel } from '../../../domain/entities/Hotel';
import { httpClient } from '../../http/client';

export class ApiHotelRepository implements IHotelRepository {
  private baseUrl = 'api/hotels/';

  async getAll(): Promise<Hotel[]> {
    return httpClient.get<Hotel[]>(this.baseUrl);
  }

  async getById(id: number): Promise<Hotel | null> {
    try {
      return await httpClient.get<Hotel>(`${this.baseUrl}${id}`);
    } catch (error) {
      // If 404, return null as per contract
      return null;
    }
  }

  async create(data: Omit<Hotel, 'id'> & { kiosks_details?: { serial_number: string, location: string }[] }): Promise<Hotel> {
    return httpClient.post<Hotel>(this.baseUrl, data);
  }

  async update(id: number, data: Partial<Hotel>): Promise<Hotel> {
    return httpClient.patch<Hotel>(`${this.baseUrl}${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${id}`);
  }

  async search(query: string): Promise<Hotel[]> {
    // Assuming backend supports ?q= search, otherwise filter client side or adjust endpoint
    return httpClient.get<Hotel[]>(`${this.baseUrl}?q=${encodeURIComponent(query)}`);
  }
}
