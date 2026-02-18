import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { User, Role, StaffMember } from '../../domain/entities/User';
import { httpClient } from '../http/client';
import type {
  ApiPermissionDTO,
  ApiRoleDTO,
  ApiRolePermissionsDTO,
  ApiUserDTO,
} from '../dto/backend';

type UserCreatePayload = {
  name?: string;
  email: string;
  mobile?: string;
  department?: string;
  password?: string;
  role?: string;
};

type UserUpdatePayload = {
  name?: string;
  email?: string;
  mobile?: string;
  department?: string;
  password?: string;
  status?: string;
  role?: string;
};

export class ApiUserRepository implements IUserRepository {
  private baseUrl = 'api/users/';

  private mapUserStatus(status: string | null | undefined): User['status'] {
    if (!status) {
      return 'Inactive';
    }
    return status;
  }

  private mapRoleStatus(status: string | null | undefined): Role['status'] {
    return status === 'Inactive' ? 'Inactive' : 'Active';
  }

  private resolveDepartment(data: Partial<ApiUserDTO> & { role?: string }): string {
    return data.department ?? data.role ?? '';
  }

  private mapUser = (data: ApiUserDTO): User => ({
    id: String(data.id),
    employeeId: data.employee_id ?? undefined,
    name: data.name ?? '',
    email: data.email ?? '',
    role: data.role ?? '',
    status: this.mapUserStatus(data.status),
    mobile: data.mobile ?? undefined,
    phone: data.mobile ?? undefined,
    lastLogin: data.last_login ?? undefined,
    dateAdded: data.date_added ?? undefined,
    avatar: data.avatar ?? undefined,
  });

  private mapRole = (data: ApiRoleDTO): Role => ({
    id: String(data.id),
    name: data.name,
    description: data.description || data.desc || '',
    desc: data.desc || data.description || '',
    permissions: [],
    userCount: data.userCount ?? 0,
    color: data.color || 'blue',
    status: this.mapRoleStatus(data.status),
  });

  async getAll(): Promise<User[]> {
    const data = await httpClient.get<ApiUserDTO[]>(this.baseUrl);
    return data.map(this.mapUser);
  }

  async getById(id: string): Promise<User | null> {
    try {
      const result = await httpClient.get<ApiUserDTO>(`${this.baseUrl}${id}`);
      return this.mapUser(result);
    } catch (_error) {
      return null;
    }
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const payload: UserCreatePayload = {
      name: data.name,
      email: data.email,
      mobile: data.mobile ?? data.phone,
      department: this.resolveDepartment(data as Partial<ApiUserDTO> & { role?: string }),
      role: data.role,
    };
    const result = await httpClient.post<ApiUserDTO>(this.baseUrl, payload);
    return this.mapUser(result);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const payload: UserUpdatePayload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.status !== undefined) payload.status = data.status;
    if (data.role !== undefined) payload.role = data.role;
    if (data.mobile !== undefined || data.phone !== undefined) {
      payload.mobile = data.mobile ?? data.phone;
    }
    if ((data as Partial<ApiUserDTO>).department !== undefined) {
      payload.department = (data as Partial<ApiUserDTO>).department ?? undefined;
    }

    const result = await httpClient.patch<ApiUserDTO>(`${this.baseUrl}${id}`, payload);
    return this.mapUser(result);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}${id}`);
  }

  async getRoles(): Promise<Role[]> {
    const data = await httpClient.get<ApiRoleDTO[]>('api/roles/');
    return data.map(this.mapRole);
  }

  async createRole(data: Role): Promise<Role> {
    const payload = {
      name: data.name,
      description: data.description || data.desc || '',
      color: data.color || 'blue',
      status: data.status || 'Active'
    };
    const result = await httpClient.post<ApiRoleDTO>('api/roles/', payload);
    return this.mapRole(result);
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const payload: { description?: string; color?: string; status?: string } = {};
    if (data.description !== undefined || data.desc !== undefined) {
      payload.description = data.description || data.desc;
    }
    if (data.color !== undefined) payload.color = data.color;
    if (data.status !== undefined) payload.status = data.status;

    const result = await httpClient.patch<ApiRoleDTO>(`api/roles/${id}`, payload);
    return this.mapRole(result);
  }

  async deleteRole(id: string): Promise<void> {
    await httpClient.delete(`api/roles/${id}`);
  }

  async getAvailablePermissions(): Promise<{ id: string; permission_key: string; description: string }[]> {
    const data = await httpClient.get<ApiPermissionDTO[]>('api/permissions/');
    return data.map((item) => ({
      id: item.id,
      permission_key: item.permission_key,
      description: item.description ?? '',
    }));
  }

  async getRolePermissions(roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }> {
    return await httpClient.get<ApiRolePermissionsDTO>(`api/roles/${roleId}/permissions`);
  }

  async setRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    await httpClient.put(`api/roles/${roleId}/permissions`, { permissions });
  }

  async getStaff(): Promise<StaffMember[]> {
    const users = await this.getAll();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.mobile || u.phone || '',
      role: u.role,
      department: this.resolveDepartment(u as Partial<ApiUserDTO> & { role?: string }),
      status: u.status,
      lastLogin: u.lastLogin || 'Never',
      avatar: u.avatar
    }));
  }
}
