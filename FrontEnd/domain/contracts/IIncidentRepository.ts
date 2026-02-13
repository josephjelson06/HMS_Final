import type { Incident } from '../entities/Incident';

export interface IIncidentRepository {
  getAll(): Promise<Incident[]>;
  getById(id: string): Promise<Incident | null>;
  create(data: Omit<Incident, 'id'>): Promise<Incident>;
  update(id: string, data: Partial<Incident>): Promise<Incident>;
  delete(id: string): Promise<void>;
}
