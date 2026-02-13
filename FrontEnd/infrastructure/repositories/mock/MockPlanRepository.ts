import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { PlanData } from '../../domain/entities/Plan';
import { INITIAL_PLANS } from '../../data/plans';

export class MockPlanRepository implements IPlanRepository {
  private data: PlanData[] = INITIAL_PLANS.map(p => ({ ...p }));

  async getAll(): Promise<PlanData[]> {
    return this.data;
  }

  async getById(id: string): Promise<PlanData | null> {
    return this.data.find(p => p.id === id) ?? null;
  }

  async create(input: Omit<PlanData, 'id'>): Promise<PlanData> {
    const plan: PlanData = { id: `p-${Date.now()}`, ...input };
    this.data.push(plan);
    return plan;
  }

  async update(id: string, input: Partial<PlanData>): Promise<PlanData> {
    const idx = this.data.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`Plan ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    this.data = this.data.filter(p => p.id !== id);
  }
}
