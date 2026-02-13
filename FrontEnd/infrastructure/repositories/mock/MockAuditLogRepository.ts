import type { IAuditLogRepository } from '@/domain/contracts/IAuditLogRepository';
import type { AuditLog } from '@/domain/entities/AuditLog';
import { mockLogs } from '@/data/auditLogs';

export class MockAuditLogRepository implements IAuditLogRepository {
  async getAll(): Promise<AuditLog[]> {
    return mockLogs;
  }

  async getById(id: string): Promise<AuditLog | null> {
    return mockLogs.find((l) => l.id === id) ?? null;
  }
}
