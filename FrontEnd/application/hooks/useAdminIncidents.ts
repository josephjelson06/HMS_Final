'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Incident } from '@/domain/entities/Incident';
import { repositories } from '@/infrastructure/config/container';
import { httpClient } from '@/infrastructure/http/client';

export type AdminIncident = Incident & { hotelName?: string; hotelId: number };

export function useAdminIncidents() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      // We need to add a method to ApiIncidentRepository or just use httpClient directly here for the admin route
      // Since specific repo methods are usually scoped to a hotel, direct call might be cleaner for this specific super-admin use case
      const data = await httpClient.get<any[]>('api/incidents');
      
      const mapped: AdminIncident[] = data.map(item => ({
        ...item,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        slaBreached: item.sla_breached,
        guestName: item.guest_name || 'Guest',
        reportedBy: item.reported_by || 'System',
        assignedTo: item.assigned_to || 'Unassigned',
        hotelName: item.hotel_name,
        hotelId: item.hotel_id
      }));

      setIncidents(mapped);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch global incidents'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  return { incidents, loading, error, refetch: fetchIncidents };
}
