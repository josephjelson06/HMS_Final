import type { Incident } from '../entities/Incident';

export interface IIncidentRepository {
  getAll(hotelId: string): Promise<Incident[]>;
  getById(id: string, hotelId: string): Promise<Incident | null>;
  create(data: Omit<Incident, 'id'>, hotelId: string): Promise<Incident>;
  update(id: string, data: Partial<Incident>, hotelId: string): Promise<Incident>;
  delete(id: string, hotelId: string): Promise<void>;
}
