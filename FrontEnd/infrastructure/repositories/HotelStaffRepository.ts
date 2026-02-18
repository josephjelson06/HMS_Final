import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { HotelStaffMember, HotelRole } from '../../domain/entities/HotelStaff';
import { httpClient } from '../http/client';

export class ApiHotelStaffRepository implements IHotelStaffRepository {

  // ── Staff (hotel-scoped) ─────────────────────────────────────

  async getAllStaff(hotelId: string): Promise<HotelStaffMember[]> {
    const data = await httpClient.get<any[]>(`api/hotels/${hotelId}/users`);
    return data.map(u => ({
      id: u.employee_id || u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile || '',
      role: u.role,
      status: u.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: u.last_login || 'Never',
      dateAdded: u.date_added
    }));
  }

  // ── Roles (hotel-scoped) ─────────────────────────────────────

  async getAllRoles(hotelId: string): Promise<HotelRole[]> {
    const data = await httpClient.get<any[]>(`api/hotels/${hotelId}/roles`);
    return data.map(r => ({
      id: r.id,
      name: r.name,
      desc: r.description || r.desc || '',
      userCount: r.userCount || 0,
      color: r.color || 'blue',
      status: r.status || 'Active'
    }));
  }

  // ── CRUD ─────────────────────────────────────────────────────

  async getStaffById(id: string, hotelId: string): Promise<HotelStaffMember | null> {
    const all = await this.getAllStaff(hotelId);
    return all.find(s => s.id === id) || null;
  }

  async createStaff(data: Omit<HotelStaffMember, 'id'>, hotelId: string): Promise<HotelStaffMember> {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      mobile: data.mobile,
      status: data.status,
      password: 'changeme123',
      department: data.role
    };
    const result = await httpClient.post<any>(`api/hotels/${hotelId}/users`, payload);
    return {
      id: result.employee_id || result.id,
      name: result.name,
      email: result.email,
      mobile: result.mobile,
      role: result.role,
      status: result.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: result.last_login || 'Never',
      dateAdded: result.date_added
    };
  }

  async updateStaff(id: string, data: Partial<HotelStaffMember>, hotelId: string): Promise<HotelStaffMember> {
    // Find user UUID from employee_id
    const users = await httpClient.get<any[]>(`api/hotels/${hotelId}/users`);
    const user = users.find(u => u.employee_id === id || u.id === id);
    if (!user) throw new Error(`Staff member ${id} not found`);

    const result = await httpClient.patch<any>(`api/hotels/${hotelId}/users/${user.id}`, data);
    return {
      id: result.employee_id || result.id,
      name: result.name,
      email: result.email,
      mobile: result.mobile,
      role: result.role,
      status: result.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: result.last_login || 'Never',
      dateAdded: result.date_added
    };
  }

  async deleteStaff(id: string, hotelId: string): Promise<void> {
    const users = await httpClient.get<any[]>(`api/hotels/${hotelId}/users`);
    const user = users.find(u => u.employee_id === id || u.id === id);
    if (!user) throw new Error(`Staff member ${id} not found`);

    await httpClient.delete(`api/hotels/${hotelId}/users/${user.id}`);
  }

  // ── Role CRUD (hotel-scoped) ─────────────────────────────────

  async createRole(data: Omit<HotelRole, 'id' | 'userCount'>, hotelId: string): Promise<HotelRole> {
    const payload = {
      name: data.name,
      description: data.desc || '',
      color: data.color || 'blue',
      status: data.status || 'Active'
    };
    const result = await httpClient.post<any>(`api/hotels/${hotelId}/roles`, payload);
    return {
      id: result.id,
      name: result.name,
      desc: result.description || result.desc || '',
      userCount: result.userCount || 0,
      color: result.color || 'blue',
      status: result.status || 'Active'
    };
  }

  async updateRole(name: string, data: Partial<HotelRole>, hotelId: string): Promise<HotelRole> {
    const payload: any = {};
    if (data.desc !== undefined) payload.description = data.desc;
    if (data.color !== undefined) payload.color = data.color;
    if (data.status !== undefined) payload.status = data.status;

    const result = await httpClient.patch<any>(`api/hotels/${hotelId}/roles/${name}`, payload);
    return {
      id: result.id,
      name: result.name,
      desc: result.description || result.desc || '',
      userCount: result.userCount || 0,
      color: result.color || 'blue',
      status: result.status || 'Active'
    };
  }

  async deleteRole(name: string, hotelId: string): Promise<void> {
    await httpClient.delete(`api/hotels/${hotelId}/roles/${name}`);
  }

  // ── Permissions Matrix ───────────────────────────────────────

  async getRolePermissions(hotelId: string, roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }> {
    return httpClient.get(`api/hotels/${hotelId}/roles/${roleId}/permissions`);
  }

  async setRolePermissions(hotelId: string, roleId: string, permissions: string[]): Promise<void> {
    await httpClient.put(`api/hotels/${hotelId}/roles/${roleId}/permissions`, { permissions });
  }

  async getAvailablePermissions(hotelId: string): Promise<{ id: string; permission_key: string; description: string }[]> {
    return httpClient.get(`api/hotels/${hotelId}/permissions/`);
  }
}
