'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DetachedGuest as Guest } from './_detachedTypes';
import { useAuth } from './useAuth';

export function useGuests() {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setGuests([]);
    setError(null);
    setLoading(false);
  }, [user?.hotelId]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const createGuest = useCallback(async (data: Omit<Guest, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Guest data linkage is disabled');
  }, [user?.hotelId]);

  const updateGuest = useCallback(async (id: string, data: Partial<Guest>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Guest data linkage is disabled');
  }, [user?.hotelId]);

  return { guests, loading, error, createGuest, updateGuest, refetch: fetchGuests };
}
