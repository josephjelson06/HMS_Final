import { useState, useEffect } from 'react';
import type { User, Role, StaffMember } from '../../domain/entities/User';
import { repositories } from '../../infrastructure/config/container';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([
      repositories.users.getAll(),
      repositories.users.getRoles(),
    ])
      .then(([u, r]) => { setUsers(u); setRoles(r); })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createUser = async (data: Omit<User, 'id'>) => {
    const user = await repositories.users.create(data);
    setUsers(prev => [...prev, user]);
    return user;
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const user = await repositories.users.update(id, data);
    setUsers(prev => prev.map(u => u.id === id ? user : u));
    return user;
  };

  const deleteUser = async (id: string) => {
    await repositories.users.delete(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const createRole = async (data: Role) => {
    const role = await repositories.users.createRole(data);
    setRoles(prev => [...prev, role]);
    return role;
  };

  const updateRole = async (name: string, data: Partial<Role>) => {
    const role = await repositories.users.updateRole(name, data);
    setRoles(prev => prev.map(r => r.name === name ? role : r));
    return role;
  };

  const deleteRole = async (name: string) => {
    await repositories.users.deleteRole(name);
    setRoles(prev => prev.filter(r => r.name !== name));
  };

  return { users, roles, loading, error, createUser, updateUser, deleteUser, createRole, updateRole, deleteRole };
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    repositories.users.getStaff()
      .then(setStaff)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { staff, loading, error };
}
