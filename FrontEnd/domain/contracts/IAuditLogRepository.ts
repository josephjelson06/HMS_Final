import type { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
  getAll(): Promise<AuditLog[]>;
  getById(id: string): Promise<AuditLog | null>;
}
