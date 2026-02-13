import type { User, Role, StaffMember } from '../entities/User';

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  getRoles(): Promise<Role[]>;
  getStaff(): Promise<StaffMember[]>;
}
