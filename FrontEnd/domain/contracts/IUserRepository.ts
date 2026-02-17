import type { User, Role, StaffMember } from '../entities/User';

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  getRoles(): Promise<Role[]>;
  createRole(data: Role): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  getStaff(): Promise<StaffMember[]>;
  getAvailablePermissions(): Promise<{ id: string; permission_key: string; description: string }[]>;
  getRolePermissions(roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }>;
  setRolePermissions(roleId: string, permissions: string[]): Promise<void>;
}
