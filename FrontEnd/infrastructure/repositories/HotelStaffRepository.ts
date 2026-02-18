import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { HotelStaffMember, HotelRole } from '../../domain/entities/HotelStaff';
import { httpClient } from '../http/client';
import type {
  ApiPermissionDTO,
  ApiRoleDTO,
  ApiRolePermissionsDTO,
  ApiUserDTO,
} from '../dto/backend';

type HotelUserCreatePayload = {
  name?: string;
  email: string;
  mobile?: string;
  department?: string;
  password?: string;
  role?: string;
};

type HotelUserUpdatePayload = {
  name?: string;
  email?: string;
  mobile?: string;
  department?: string;
  password?: string;
  status?: string;
  role?: string;
};

type HotelRoleCreatePayload = {
  name: string;
  description?: string;
  color?: string;
  status?: string;
};

type HotelRoleUpdatePayload = {
  description?: string;
  color?: string;
  status?: string;
};

export class ApiHotelStaffRepository implements IHotelStaffRepository {
  private mapStaff(data: ApiUserDTO): HotelStaffMember {
    return {
      id: data.employee_id ?? String(data.id),
      employeeId: data.employee_id ?? undefined,
      name: data.name ?? '',
      email: data.email ?? '',
      mobile: data.mobile ?? '',
      role: data.role ?? '',
      status: data.status === 'Active' ? 'Active' : 'Inactive',
      lastLogin: data.last_login ?? 'Never',
      dateAdded: data.date_added ?? undefined,
    };
  }

  private mapRole(data: ApiRoleDTO): HotelRole {
    return {
      id: String(data.id),
      name: data.name,
      desc: data.description || data.desc || '',
      userCount: data.userCount ?? 0,
      color: data.color || 'blue',
      status: data.status || 'Active',
    };
  }

  private async resolveUserId(hotelId: string, staffId: string): Promise<string> {
    const users = await httpClient.get<ApiUserDTO[]>(`api/hotels/${hotelId}/users`);
    const user = users.find((u) => u.employee_id === staffId || String(u.id) === staffId);
    if (!user) {
      throw new Error(`Staff member ${staffId} not found`);
    }
    return String(user.id);
  }

  async getAllStaff(hotelId: string): Promise<HotelStaffMember[]> {
    const data = await httpClient.get<ApiUserDTO[]>(`api/hotels/${hotelId}/users`);
    return data.map((user) => this.mapStaff(user));
  }

  async getAllRoles(hotelId: string): Promise<HotelRole[]> {
    const data = await httpClient.get<ApiRoleDTO[]>(`api/hotels/${hotelId}/roles`);
    return data.map((role) => this.mapRole(role));
  }

  async getStaffById(id: string, hotelId: string): Promise<HotelStaffMember | null> {
    const all = await this.getAllStaff(hotelId);
    return all.find((s) => s.id === id || s.employeeId === id) || null;
  }

  async createStaff(data: Omit<HotelStaffMember, 'id'>, hotelId: string): Promise<HotelStaffMember> {
    const payload: HotelUserCreatePayload = {
      name: data.name,
      email: data.email,
      role: data.role,
      mobile: data.mobile,
      department: data.role,
      password: 'changeme123',
    };

    const result = await httpClient.post<ApiUserDTO>(`api/hotels/${hotelId}/users`, payload);
    return this.mapStaff(result);
  }

  async updateStaff(
    id: string,
    data: Partial<HotelStaffMember>,
    hotelId: string,
  ): Promise<HotelStaffMember> {
    const userId = await this.resolveUserId(hotelId, id);
    const payload: HotelUserUpdatePayload = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.mobile !== undefined) payload.mobile = data.mobile;
    if (data.role !== undefined) {
      payload.role = data.role;
      payload.department = data.role;
    }
    if (data.status !== undefined) payload.status = data.status;

    const result = await httpClient.patch<ApiUserDTO>(`api/hotels/${hotelId}/users/${userId}`, payload);
    return this.mapStaff(result);
  }

  async deleteStaff(id: string, hotelId: string): Promise<void> {
    const userId = await this.resolveUserId(hotelId, id);
    await httpClient.delete(`api/hotels/${hotelId}/users/${userId}`);
  }

  async createRole(data: Omit<HotelRole, 'id' | 'userCount'>, hotelId: string): Promise<HotelRole> {
    const payload: HotelRoleCreatePayload = {
      name: data.name,
      description: data.desc || '',
      color: data.color || 'blue',
      status: data.status || 'Active',
    };
    const result = await httpClient.post<ApiRoleDTO>(`api/hotels/${hotelId}/roles`, payload);
    return this.mapRole(result);
  }

  async updateRole(name: string, data: Partial<HotelRole>, hotelId: string): Promise<HotelRole> {
    const payload: HotelRoleUpdatePayload = {};
    if (data.desc !== undefined) payload.description = data.desc;
    if (data.color !== undefined) payload.color = data.color;
    if (data.status !== undefined) payload.status = data.status;

    const result = await httpClient.patch<ApiRoleDTO>(`api/hotels/${hotelId}/roles/${name}`, payload);
    return this.mapRole(result);
  }

  async deleteRole(name: string, hotelId: string): Promise<void> {
    await httpClient.delete(`api/hotels/${hotelId}/roles/${name}`);
  }

  async getRolePermissions(
    hotelId: string,
    roleId: string,
  ): Promise<{ role_id: string; role_name: string; permissions: string[] }> {
    return httpClient.get<ApiRolePermissionsDTO>(`api/hotels/${hotelId}/roles/${roleId}/permissions`);
  }

  async setRolePermissions(hotelId: string, roleId: string, permissions: string[]): Promise<void> {
    await httpClient.put(`api/hotels/${hotelId}/roles/${roleId}/permissions`, { permissions });
  }

  async getAvailablePermissions(
    hotelId: string,
  ): Promise<{ id: string; permission_key: string; description: string }[]> {
    const data = await httpClient.get<ApiPermissionDTO[]>(`api/hotels/${hotelId}/permissions/`);
    return data.map((item) => ({
      id: String(item.id),
      permission_key: item.permission_key,
      description: item.description ?? '',
    }));
  }
}
