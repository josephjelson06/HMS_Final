import type { HotelStaffMember, HotelRole } from '../entities/HotelStaff';

export interface IHotelStaffRepository {
  getAllStaff(hotelId: string): Promise<HotelStaffMember[]>;
  getAllRoles(hotelId: string): Promise<HotelRole[]>;
  getStaffById(id: string, hotelId: string): Promise<HotelStaffMember | null>;
  createStaff(data: Omit<HotelStaffMember, 'id'>, hotelId: string): Promise<HotelStaffMember>;
  updateStaff(id: string, data: Partial<HotelStaffMember>, hotelId: string): Promise<HotelStaffMember>;
  deleteStaff(id: string, hotelId: string): Promise<void>;
}
