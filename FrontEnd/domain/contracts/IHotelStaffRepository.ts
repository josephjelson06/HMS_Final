import type { HotelStaffMember, HotelRole } from '../entities/HotelStaff';

export interface IHotelStaffRepository {
  getAllStaff(): Promise<HotelStaffMember[]>;
  getAllRoles(): Promise<HotelRole[]>;
  getStaffById(id: string): Promise<HotelStaffMember | null>;
  createStaff(data: Omit<HotelStaffMember, 'id'>): Promise<HotelStaffMember>;
  updateStaff(id: string, data: Partial<HotelStaffMember>): Promise<HotelStaffMember>;
  deleteStaff(id: string): Promise<void>;
}
