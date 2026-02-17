import { useState, useEffect, useCallback } from 'react';
import type { HotelStaffMember, HotelRole } from '@/domain/entities/HotelStaff';
import { repositories } from '@/infrastructure/config/container';
import { useAuth } from './useAuth';

export function useHotelStaff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<HotelStaffMember[]>([]);
  const [roles, setRoles] = useState<HotelRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.hotelId) return;
    try {
      setLoading(true);
      const [staffData, rolesData] = await Promise.all([
        repositories.hotelStaff.getAllStaff(user.hotelId),
        repositories.hotelStaff.getAllRoles(user.hotelId),
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel staff'));
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Staff CRUD ────────────────────────────────────────────
  const createStaff = useCallback(async (data: Omit<HotelStaffMember, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const created = await repositories.hotelStaff.createStaff(data, user.hotelId);
    setStaff((prev) => [...prev, created]);
    return created;
  }, [user?.hotelId]);

  const updateStaff = useCallback(async (id: string, data: Partial<HotelStaffMember>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const updated = await repositories.hotelStaff.updateStaff(id, data, user.hotelId);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, [user?.hotelId]);

  const deleteStaff = useCallback(async (id: string) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    await repositories.hotelStaff.deleteStaff(id, user.hotelId);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, [user?.hotelId]);

  // ── Role CRUD ─────────────────────────────────────────────
  const createRole = useCallback(async (data: Omit<HotelRole, 'id' | 'userCount'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const role = await repositories.hotelStaff.createRole(data, user.hotelId);
    setRoles((prev) => [...prev, role]);
    return role;
  }, [user?.hotelId]);

  const updateRole = useCallback(async (name: string, data: Partial<HotelRole>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const role = await repositories.hotelStaff.updateRole(name, data, user.hotelId);
    setRoles((prev) => prev.map((r) => (r.name === name ? role : r)));
    return role;
  }, [user?.hotelId]);

  const deleteRole = useCallback(async (name: string) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    await repositories.hotelStaff.deleteRole(name, user.hotelId);
    setRoles((prev) => prev.filter((r) => r.name !== name));
  }, [user?.hotelId]);

  // ── Permissions Matrix ────────────────────────────────────
  const getAvailablePermissions = useCallback(async () => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    return repositories.hotelStaff.getAvailablePermissions(user.hotelId);
  }, [user?.hotelId]);

  const getRolePermissions = useCallback(async (roleId: string) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    return repositories.hotelStaff.getRolePermissions(user.hotelId, roleId);
  }, [user?.hotelId]);

  const setRolePermissions = useCallback(async (roleId: string, permissions: string[]) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    await repositories.hotelStaff.setRolePermissions(user.hotelId, roleId, permissions);
  }, [user?.hotelId]);

  return {
    staff, roles, loading, error,
    createStaff, updateStaff, deleteStaff,
    createRole, updateRole, deleteRole,
    getAvailablePermissions, getRolePermissions, setRolePermissions,
    refetch: fetchData,
  };
}
