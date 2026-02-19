import type { User, Role } from '../entities/User';

export interface IHotelStaffRepository {
  getAllStaff(hotelId: string): Promise<User[]>;
  getAllRoles(hotelId: string): Promise<Role[]>;
  createStaff(data: Omit<User, 'id'>, hotelId: string): Promise<User>;
  updateStaff(id: string, data: Partial<User>, hotelId: string): Promise<User>;
  deleteStaff(id: string, hotelId: string): Promise<void>;
  
  createRole(data: Omit<Role, 'id' | 'userCount'>, hotelId: string): Promise<Role>;
  updateRole(id: string, data: Partial<Role>, hotelId: string): Promise<Role>;
  deleteRole(id: string, hotelId: string): Promise<void>;
}
