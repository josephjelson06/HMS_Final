import type { IIncidentRepository } from '@/domain/contracts/IIncidentRepository';
import type { Incident } from '@/domain/entities/Incident';
import { mockIncidents } from '@/data/incidents';

export class MockIncidentRepository implements IIncidentRepository {
  async getAll(): Promise<Incident[]> {
    return mockIncidents;
  }

  async getById(id: string): Promise<Incident | null> {
    return mockIncidents.find((i) => i.id === id) ?? null;
  }

  async create(data: Omit<Incident, 'id'>): Promise<Incident> {
    return { id: `INC-${Date.now()}`, ...data };
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    const existing = mockIncidents.find((i) => i.id === id);
    return { ...(existing ?? mockIncidents[0]), ...data } as Incident;
  }

  async delete(_id: string): Promise<void> {
    /* no-op in mock */
  }
}
