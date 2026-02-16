import type { IHotelStaffRepository } from '@/domain/contracts/IHotelStaffRepository';
import type { HotelStaffMember, HotelRole } from '@/domain/entities/HotelStaff';
import { httpClient } from '../../http/client';

export class ApiHotelStaffRepository implements IHotelStaffRepository {
  async getAllStaff(_hotelId: string): Promise<HotelStaffMember[]> {
    const data = await httpClient.get<any[]>('api/users');
    return data.map(u => ({
      id: u.employee_id,
      name: u.name,
      email: u.email,
      mobile: u.mobile || '',
      role: u.role,
      status: u.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: u.last_login || 'Never',
      dateAdded: u.date_added
    }));
  }

  async getAllRoles(_hotelId: string): Promise<HotelRole[]> {
    const data = await httpClient.get<any[]>('api/roles');
    return data.map(r => ({
      name: r.name,
      desc: r.description || r.desc || '',
      userCount: r.userCount || 0,
      color: r.color || 'blue',
      status: r.status || 'Active'
    }));
  }

  async getStaffById(id: string, _hotelId: string): Promise<HotelStaffMember | null> {
    const all = await this.getAllStaff(_hotelId);
    return all.find(s => s.id === id) || null;
  }

  async createStaff(data: Omit<HotelStaffMember, 'id'>, _hotelId: string): Promise<HotelStaffMember> {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      mobile: data.mobile,
      status: data.status,
      password: 'password123', // Default password for new staff
      department: data.role // Simplified mapping
    };
    const result = await httpClient.post<any>('api/users', payload);
    return {
      id: result.employee_id,
      name: result.name,
      email: result.email,
      mobile: result.mobile,
      role: result.role,
      status: result.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: result.last_login || 'Never',
      dateAdded: result.date_added
    };
  }

  async updateStaff(id: string, data: Partial<HotelStaffMember>, _hotelId: string): Promise<HotelStaffMember> {
    // We need the numeric ID for the API
    const users = await httpClient.get<any[]>('api/users');
    const user = users.find(u => u.employee_id === id);
    if (!user) throw new Error(`Staff member ${id} not found`);

    const result = await httpClient.patch<any>(`api/users/${user.id}`, data);
    return {
      id: result.employee_id,
      name: result.name,
      email: result.email,
      mobile: result.mobile,
      role: result.role,
      status: result.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: result.last_login || 'Never',
      dateAdded: result.date_added
    };
  }

  async deleteStaff(id: string, _hotelId: string): Promise<void> {
    const users = await httpClient.get<any[]>('api/users');
    const user = users.find(u => u.employee_id === id);
    if (!user) throw new Error(`Staff member ${id} not found`);

    await httpClient.delete(`api/users/${user.id}`);
  }
}
