import type { Guest } from '../entities/Guest';

export interface IGuestRepository {
  getAll(): Promise<Guest[]>;
  getById(id: string): Promise<Guest | null>;
  create(data: Omit<Guest, 'id'>): Promise<Guest>;
  update(id: string, data: Partial<Guest>): Promise<Guest>;
  delete(id: string): Promise<void>;
}
