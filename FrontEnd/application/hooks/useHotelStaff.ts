'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HotelStaffMember, HotelRole } from '@/domain/entities/HotelStaff';
import { repositories } from '@/infrastructure/config/container';

export function useHotelStaff() {
  const [staff, setStaff] = useState<HotelStaffMember[]>([]);
  const [roles, setRoles] = useState<HotelRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffData, rolesData] = await Promise.all([
        repositories.hotelStaff.getAllStaff(),
        repositories.hotelStaff.getAllRoles(),
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch hotel staff'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createStaff = useCallback(async (data: Omit<HotelStaffMember, 'id'>) => {
    const created = await repositories.hotelStaff.createStaff(data);
    setStaff((prev) => [...prev, created]);
    return created;
  }, []);

  const updateStaff = useCallback(async (id: string, data: Partial<HotelStaffMember>) => {
    const updated = await repositories.hotelStaff.updateStaff(id, data);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  return { staff, roles, loading, error, createStaff, updateStaff, refetch: fetchData };
}
