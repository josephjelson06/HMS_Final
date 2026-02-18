import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { User, Role, StaffMember } from '../../domain/entities/User';
import { httpClient } from '../http/client';

export class ApiUserRepository implements IUserRepository {
  private baseUrl = 'api/users/';

  async getAll(): Promise<User[]> {
    const data = await httpClient.get<any[]>(this.baseUrl);
    return data.map(d => ({
      id: d.id, // UUID
      employeeId: d.employee_id,
      name: d.name,
      email: d.email,
      role: d.role,
      status: d.status,
      mobile: d.mobile,
      lastLogin: d.last_login,
      dateAdded: d.date_added,
      avatar: d.avatar
    }));
  }

  async getById(id: string): Promise<User | null> {
    try {
      const u = await httpClient.get<any>(`${this.baseUrl}${id}`);
      return {
        id: u.id,
        employeeId: u.employee_id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        mobile: u.mobile,
        lastLogin: u.last_login,
        dateAdded: u.date_added,
        avatar: u.avatar
      };
    } catch (error) {
      return null;
    }
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      mobile: data.mobile,
      department: (data as any).department || data.role
    };
    const result = await httpClient.post<any>(this.baseUrl, payload);
    return {
      id: result.id,
      employeeId: result.employee_id,
      name: result.name,
      email: result.email,
      role: result.role,
      status: result.status,
      mobile: result.mobile,
      lastLogin: result.last_login,
      dateAdded: result.date_added,
      avatar: result.avatar
    };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.status) payload.status = data.status;
    if (data.role) payload.role = data.role;
    if (data.mobile) payload.mobile = data.mobile;
    if ((data as any).department) payload.department = (data as any).department;

    const result = await httpClient.patch<any>(`${this.baseUrl}${id}`, payload);
    return {
      id: result.id,
      employeeId: result.employee_id,
      name: result.name,
      email: result.email,
      role: result.role,
      status: result.status,
      mobile: result.mobile,
      lastLogin: result.last_login,
      dateAdded: result.date_added,
      avatar: result.avatar
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}${id}`);
  }

  async getRoles(): Promise<Role[]> {
    const data = await httpClient.get<any[]>('api/roles');
    return data.map(r => ({
      id: String(r.id),
      name: r.name,
      description: r.description || r.desc || '',
      desc: r.desc || r.description || '',
      permissions: [],
      userCount: r.userCount || 0,
      color: r.color || 'blue',
      status: r.status || 'Active'
    }));
  }

  async createRole(data: Role): Promise<Role> {
    const payload = {
      name: data.name,
      description: data.description || data.desc || '',
      color: data.color || 'blue',
      status: data.status || 'Active'
    };
    const result = await httpClient.post<any>('api/roles', payload);
    return {
      id: String(result.id),
      name: result.name,
      description: result.description || result.desc || '',
      desc: result.desc || result.description || '',
      permissions: [],
      userCount: result.userCount || 0,
      color: result.color || 'blue',
      status: result.status || 'Active'
    };
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const payload: any = {};
    if (data.description !== undefined || data.desc !== undefined) {
      payload.description = data.description || data.desc;
    }
    if (data.color !== undefined) payload.color = data.color;
    if (data.status !== undefined) payload.status = data.status;

    const result = await httpClient.patch<any>(`api/roles/${id}`, payload);
    return {
      id: String(result.id),
      name: result.name,
      description: result.description || result.desc || '',
      desc: result.desc || result.description || '',
      permissions: [],
      userCount: result.userCount || 0,
      color: result.color || 'blue',
      status: result.status || 'Active'
    };
  }

  async deleteRole(id: string): Promise<void> {
    await httpClient.delete(`api/roles/${id}`);
  }

  async getAvailablePermissions(): Promise<{ id: string; permission_key: string; description: string }[]> {
    return await httpClient.get('api/permissions/');
  }

  async getRolePermissions(roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }> {
    return await httpClient.get(`api/roles/${roleId}/permissions`);
  }

  async setRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    await httpClient.put(`api/roles/${roleId}/permissions`, { permissions });
  }

  async getStaff(): Promise<StaffMember[]> {
    const users = await this.getAll();
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.mobile || '',
      role: u.role,
      department: (u as any).department || u.role,
      status: u.status,
      lastLogin: u.lastLogin || 'Never',
      avatar: u.avatar
    }));
  }
}
