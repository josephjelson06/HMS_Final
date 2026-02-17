import type { Hotel } from '../entities/Hotel';

export interface IHotelRepository {
  getAll(): Promise<Hotel[]>;
  getById(id: string): Promise<Hotel | null>;
  create(data: Omit<Hotel, 'id'> & { kiosks_details?: { serial_number: string, location: string }[] }): Promise<Hotel>;
  update(id: string, data: Partial<Hotel>): Promise<Hotel>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Hotel[]>;
}
