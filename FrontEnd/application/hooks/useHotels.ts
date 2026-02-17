import { useState, useEffect } from 'react';
import type { Hotel } from '../../domain/entities/Hotel';
import { repositories } from '../../infrastructure/config/container';

export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    repositories.hotels.getAll()
      .then(setHotels)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

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
