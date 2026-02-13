import type { Hotel } from '../entities/Hotel';

export interface IHotelRepository {
  getAll(): Promise<Hotel[]>;
  getById(id: number): Promise<Hotel | null>;
  create(data: Omit<Hotel, 'id'>): Promise<Hotel>;
  update(id: number, data: Partial<Hotel>): Promise<Hotel>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<Hotel[]>;
}
