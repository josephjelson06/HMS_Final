import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { User, Role } from '../../domain/entities/User';
import { httpClient } from '../../infrastructure/http/client';
import type { ApiUserDTO } from '../../infrastructure/dto/backend';

// Helper types for payloads
interface CreateStaffPayload {
    name: string;
    email: string;
    role_id: string; // Tenant API expects role_id
    mobile?: string;
    password?: string;
    is_active?: boolean;
}

interface UpdateStaffPayload {
    name?: string;
    email?: string;
    role_id?: string;
    mobile?: string;
    is_active?: boolean;
}

interface CreateRolePayload {
    name: string;
    description?: string;
    color?: string;
    permissions?: string[];
}

export class ApiHotelStaffRepository implements IHotelStaffRepository {
  private client = httpClient;

  // --- Staff (Tenant Users) ---

  async getAllStaff(hotelId: string): Promise<User[]> {
      const response = await this.client.get<ApiUserDTO[]>(`api/tenants/${hotelId}/users/`);
      return response.map(this.mapUserToEntity);
  }

  async createStaff(data: Omit<User, 'id'>, hotelId: string): Promise<User> {
      const payload: CreateStaffPayload = {
          name: data.name,
          email: data.email,
          role_id: data.role?.id || '',
          mobile: data.mobile,
          password: 'Password123!', 
          is_active: data.status === 'Active'
      };

      const response = await this.client.post<ApiUserDTO>(`api/tenants/${hotelId}/users/`, payload);
      return this.mapUserToEntity(response);
  }

  async updateStaff(id: string, data: Partial<User>, hotelId: string): Promise<User> {
      const payload: UpdateStaffPayload = {};
      if (data.name) payload.name = data.name;
      if (data.email) payload.email = data.email;
      if (data.role?.id) payload.role_id = data.role.id;
      if (data.mobile) payload.mobile = data.mobile;
      if (data.status) payload.is_active = data.status === 'Active';

      const response = await this.client.patch<ApiUserDTO>(`api/tenants/${hotelId}/users/${id}`, payload);
      return this.mapUserToEntity(response);
  }

  async deleteStaff(id: string, hotelId: string): Promise<void> {
      await this.client.delete(`api/tenants/${hotelId}/users/${id}`);
  }

  // --- Roles (Tenant Roles) ---

  async getAllRoles(hotelId: string): Promise<Role[]> {
      const response = await this.client.get<any[]>(`api/tenants/${hotelId}/roles/`);
      return response.map(this.mapRoleToEntity);
  }

  async createRole(data: Omit<Role, 'id' | 'userCount'>, hotelId: string): Promise<Role> {
       const payload: CreateRolePayload = {
           name: data.name,
           description: data.description,
           color: data.color,
           permissions: data.permissions 
       };
       const response = await this.client.post<any>(`api/tenants/${hotelId}/roles/`, payload);
       return this.mapRoleToEntity(response);
  }

  async updateRole(id: string, data: Partial<Role>, hotelId: string): Promise<Role> {
        const payload: any = { ...data };
        // data.permissions is already string[]
        if (data.permissions) {
            payload.permissions = data.permissions;
        }
        
        const response = await this.client.patch<any>(`api/tenants/${hotelId}/roles/${id}`, payload);
        return this.mapRoleToEntity(response);
  }

  async deleteRole(id: string, hotelId: string): Promise<void> {
       await this.client.delete(`api/tenants/${hotelId}/roles/${id}`);
  }

  // --- Mappers ---

  private mapUserToEntity(dto: ApiUserDTO): User {
      return {
          id: dto.id.toString(),
          name: dto.name || dto.email.split('@')[0],
          email: dto.email,
          role: dto.role ? {
              id: dto.role.id?.toString() || '',
              name: dto.role.name || 'Unknown',
              permissions: dto.role.permissions || [],
              color: dto.role.color || '#ccc',
              description: dto.role.description || '',
              userCount: 0
          } : undefined,
          status: dto.status === 'active' ? 'Active' : 'Inactive',
          mobile: dto.mobile || dto.phone || '', 
          lastLogin: dto.last_login || '',
          tenantId: dto.tenant_id?.toString()
      };
  }

  private mapRoleToEntity(dto: any): Role {
       // Helper to ensure permissions are strings
       const rawPerms = dto.permissions || [];
       const permissions: string[] = Array.isArray(rawPerms) 
          ? rawPerms.map((p: any) => typeof p === 'string' ? p : p.key || p.id || String(p))
          : [];

       return {
           id: dto.id?.toString(),
           name: dto.name,
           description: dto.description || '',
           color: dto.color || '#ccc',
           permissions,
           userCount: dto.users_count || 0
       };
  }
}
