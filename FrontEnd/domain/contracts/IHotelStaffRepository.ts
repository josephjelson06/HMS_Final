import type { HotelStaffMember, HotelRole } from '../entities/HotelStaff';

export interface IHotelStaffRepository {
  getAllStaff(hotelId: string): Promise<HotelStaffMember[]>;
  getAllRoles(hotelId: string): Promise<HotelRole[]>;
  getStaffById(id: string, hotelId: string): Promise<HotelStaffMember | null>;
  createStaff(data: Omit<HotelStaffMember, 'id'>, hotelId: string): Promise<HotelStaffMember>;
  updateStaff(id: string, data: Partial<HotelStaffMember>, hotelId: string): Promise<HotelStaffMember>;
  deleteStaff(id: string, hotelId: string): Promise<void>;

  // Role CRUD
  createRole(data: Omit<HotelRole, 'id' | 'userCount'>, hotelId: string): Promise<HotelRole>;
  updateRole(name: string, data: Partial<HotelRole>, hotelId: string): Promise<HotelRole>;
  deleteRole(name: string, hotelId: string): Promise<void>;

  // Permissions Matrix
  getRolePermissions(hotelId: string, roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }>;
  setRolePermissions(hotelId: string, roleId: string, permissions: string[]): Promise<void>;
  getAvailablePermissions(hotelId: string): Promise<{ id: string; permission_key: string; description: string }[]>;
}
