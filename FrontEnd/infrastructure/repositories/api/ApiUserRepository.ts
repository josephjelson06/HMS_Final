import type { IUserRepository } from '../../../domain/contracts/IUserRepository';
import type { User, Role, StaffMember } from '../../../domain/entities/User';
import { httpClient } from '../../http/client';

export class ApiUserRepository implements IUserRepository {
  private baseUrl = 'api/users';

  async getAll(): Promise<User[]> {
    const data = await httpClient.get<any[]>(this.baseUrl);
    return data.map(d => ({
      id: d.employee_id,
      numericId: d.id,
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
    const all = await this.getAll();
    return all.find(u => u.id === id) || null;
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
      id: result.employee_id,
      numericId: result.id,
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
    // Resolve numeric ID
    let numericId = (data as any).numericId;
    if (!numericId) {
        const user = await this.getById(id);
        numericId = user?.numericId;
    }

    if (!numericId) {
        throw new Error(`Could not resolve numeric ID for user ${id}`);
    }

    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.status) payload.status = data.status;
    if (data.role) payload.role = data.role;
    if (data.mobile) payload.mobile = data.mobile;
    if ((data as any).department) payload.department = (data as any).department;

    const result = await httpClient.patch<any>(`${this.baseUrl}/${numericId}`, payload);
    return {
      id: result.employee_id,
      numericId: result.id,
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
    const user = await this.getById(id);
    if (!user?.numericId) {
        throw new Error(`Could not resolve numeric ID for deletion of user ${id}`);
    }
    await httpClient.delete(`${this.baseUrl}/${user.numericId}`);
  }

  async getRoles(): Promise<Role[]> {
    const data = await httpClient.get<any[]>('api/roles');
    return data;
  }

  async createRole(data: Role): Promise<Role> {
    const result = await httpClient.post<any>('api/roles', data);
    return result;
  }

  async updateRole(name: string, data: Partial<Role>): Promise<Role> {
    const result = await httpClient.patch<any>(`api/roles/${name}`, data);
    return result;
  }

  async deleteRole(name: string): Promise<void> {
    await httpClient.delete(`api/roles/${name}`);
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
