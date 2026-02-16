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

  return { staff, roles, loading, error, createStaff, updateStaff, refetch: fetchData };
}
