import type { PlanData } from '../entities/Plan';

export interface IPlanRepository {
  getAll(): Promise<PlanData[]>;
  getById(id: string): Promise<PlanData | null>;
  create(data: Omit<PlanData, 'id'>): Promise<PlanData>;
  update(id: string, data: Partial<PlanData>): Promise<PlanData>;
  delete(id: string): Promise<void>;
}
