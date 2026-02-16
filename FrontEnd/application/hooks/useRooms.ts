import { useState, useEffect, useCallback } from 'react';
import type { Room, RoomType, Booking, Building } from '../../domain/entities/Room';
import { repositories } from '../../infrastructure/config/container';
import { useAuth } from './useAuth';

export function useRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.hotelId) return;
    try {
      setLoading(true);
      const [r, t, b, bld] = await Promise.all([
        repositories.rooms.getAll(user.hotelId),
        repositories.rooms.getTypes(user.hotelId),
        repositories.rooms.getBookings(user.hotelId),
        repositories.rooms.getBuildings(user.hotelId),
      ]);
      setRooms(r);
      setRoomTypes(t);
      setBookings(b);
      setBuildings(bld);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createRoom = async (data: Room) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const room = await repositories.rooms.create(data, user.hotelId);
    setRooms(prev => [...prev, room]);
    return room;
  };

  const batchCreateRooms = async (data: Room[]) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const newRooms = await repositories.rooms.batchCreate(data, user.hotelId);
    setRooms(prev => [...prev, ...newRooms]);
    return newRooms;
  };

  const updateRoom = async (id: string, data: Partial<Room>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const room = await repositories.rooms.update(id, data, user.hotelId);
    setRooms(prev => prev.map(r => r.id === id ? room : r));
    return room;
  };

  const createType = async (data: Omit<RoomType, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const type = await repositories.rooms.createType(data, user.hotelId);
    setRoomTypes(prev => [...prev, type]);
    return type;
  };

  const deleteType = async (id: string) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    await repositories.rooms.deleteType(id, user.hotelId);
    setRoomTypes(prev => prev.filter(t => t.id !== id));
  };

  const createBuilding = async (name: string) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    const building = await repositories.rooms.createBuilding(name, user.hotelId);
    setBuildings(prev => [...prev, building]);
    return building;
  };

  return { rooms, roomTypes, deleteType, bookings, buildings, loading, error, createRoom, updateRoom, createType, createBuilding, batchCreateRooms, refetch: fetchData };
}
