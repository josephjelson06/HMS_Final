import { useState, useEffect } from 'react';
import type { Room, RoomType, Booking } from '../../domain/entities/Room';
import { repositories } from '../../infrastructure/config/container';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([
      repositories.rooms.getAll(),
      repositories.rooms.getTypes(),
      repositories.rooms.getBookings(),
    ])
      .then(([r, t, b]) => { setRooms(r); setRoomTypes(t); setBookings(b); })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createRoom = async (data: Omit<Room, 'id'>) => {
    const room = await repositories.rooms.create(data);
    setRooms(prev => [...prev, room]);
    return room;
  };

  const updateRoom = async (id: string, data: Partial<Room>) => {
    const room = await repositories.rooms.update(id, data);
    setRooms(prev => prev.map(r => r.id === id ? room : r));
    return room;
  };

  return { rooms, roomTypes, bookings, loading, error, createRoom, updateRoom };
}
