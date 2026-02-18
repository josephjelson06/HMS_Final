import { useState, useEffect } from 'react';
import type { PlanData } from '../../domain/entities/Plan';
import type { PlanCreateInput, PlanUpdateInput } from '../../domain/contracts/IPlanRepository';
import { repositories } from '../../infrastructure/config/container';

export function usePlans() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    repositories.plans.getAll()
      .then(setPlans)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createPlan = async (data: PlanCreateInput) => {
    const plan = await repositories.plans.create(data);
    setPlans(prev => [...prev, plan]);
    return plan;
  };

  const updatePlan = async (id: string, data: PlanUpdateInput) => {
    const plan = await repositories.plans.update(id, data);
    setPlans(prev => prev.map(p => p.id === id ? plan : p));
    return plan;
  };

  const deletePlan = async (id: string) => {
    await repositories.plans.delete(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return { plans, loading, error, createPlan, updatePlan, deletePlan };
}
