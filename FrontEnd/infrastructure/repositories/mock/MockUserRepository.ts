import type { IUserRepository } from '../../../domain/contracts/IUserRepository';
import type { User, Role, StaffMember } from '../../../domain/entities/User';
import { INITIAL_USERS, INITIAL_ROLES } from '../../../data/users';

export class MockUserRepository implements IUserRepository {
  private data: User[] = INITIAL_USERS.map(u => ({ ...u, status: u.status as User['status'] }));

  async getAll(): Promise<User[]> {
    return this.data;
  }

  async getById(id: string): Promise<User | null> {
    return this.data.find(u => u.id === id) ?? null;
  }

  async create(input: Omit<User, 'id'>): Promise<User> {
    const user: User = { id: `U-${Date.now()}`, ...input };
    this.data.push(user);
    return user;
  }

  async update(id: string, input: Partial<User>): Promise<User> {
    const idx = this.data.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    this.data = this.data.filter(u => u.id !== id);
  }

  async getRoles(): Promise<Role[]> {
    return INITIAL_ROLES.map(r => ({ ...r }));
  }

  async getStaff(): Promise<StaffMember[]> {
    return this.data.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || u.mobile || '',
      role: u.role,
      department: u.role,
      status: u.status as StaffMember['status'],
      lastLogin: u.lastLogin || 'Never',
      avatar: u.avatar,
    }));
  }
}
