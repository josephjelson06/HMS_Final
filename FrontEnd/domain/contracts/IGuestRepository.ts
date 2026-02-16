import type { Guest } from '../entities/Guest';

export interface IGuestRepository {
  getAll(hotelId: string): Promise<Guest[]>;
  getById(id: string, hotelId: string): Promise<Guest | null>;
  create(data: Omit<Guest, 'id'>, hotelId: string): Promise<Guest>;
  update(id: string, data: Partial<Guest>, hotelId: string): Promise<Guest>;
  delete(id: string, hotelId: string): Promise<void>;
}
