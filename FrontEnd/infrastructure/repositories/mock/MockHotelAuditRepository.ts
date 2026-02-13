import type { IHotelAuditRepository } from '@/domain/contracts/IHotelAuditRepository';
import type { HotelAuditLog } from '@/domain/entities/HotelAuditLog';
import { mockHotelLogs } from '@/data/hotelAudit';

export class MockHotelAuditRepository implements IHotelAuditRepository {
  async getAll(): Promise<HotelAuditLog[]> {
    return mockHotelLogs;
  }

  async getById(id: string): Promise<HotelAuditLog | null> {
    return mockHotelLogs.find((l) => l.id === id) ?? null;
  }
}
