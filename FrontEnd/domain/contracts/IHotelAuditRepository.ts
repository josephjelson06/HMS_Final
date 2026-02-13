import type { HotelAuditLog } from '../entities/HotelAuditLog';

export interface IHotelAuditRepository {
  getAll(): Promise<HotelAuditLog[]>;
  getById(id: string): Promise<HotelAuditLog | null>;
}
