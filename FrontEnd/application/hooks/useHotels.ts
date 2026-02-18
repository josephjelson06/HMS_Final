import { useState, useEffect } from 'react';
import type { Hotel } from '../../domain/entities/Hotel';
import { repositories } from '../../infrastructure/config/container';
import { useAuth } from './useAuth';

export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setHotels([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        // Hotel users should only fetch their own hotel to avoid platform-only endpoint 403.
        if (user.role === 'hotel' && user.hotelId) {
          const hotel = await repositories.hotels.getById(user.hotelId);
          setHotels(hotel ? [hotel] : []);
        } else {
          const all = await repositories.hotels.getAll();
          setHotels(all);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch hotels'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user]);

  const createHotel = async (data: Omit<Hotel, 'id'> & { kiosks_details?: { serial_number: string, location: string }[] }) => {
    const hotel = await repositories.hotels.create(data);
    setHotels(prev => [...prev, hotel]);
    return hotel;
  };

  const updateHotel = async (id: string, data: Partial<Hotel>) => {
    const hotel = await repositories.hotels.update(id, data);
    setHotels(prev => prev.map(h => h.id === id ? hotel : h));
    return hotel;
  };

  const deleteHotel = async (id: string) => {
    await repositories.hotels.delete(id);
    setHotels(prev => prev.filter(h => h.id !== id));
  };

  return { hotels, loading, error, createHotel, updateHotel, deleteHotel };
}
