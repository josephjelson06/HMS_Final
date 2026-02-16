import { useState, useEffect } from 'react';
import type { Room, RoomType, Booking } from '../../domain/entities/Room';
import { repositories } from '../../infrastructure/config/container';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([
      repositories.rooms.getAll(),
      repositories.rooms.getTypes(),
      repositories.rooms.getBookings(),
      repositories.rooms.getBuildings(),
    ])
      .then(([r, t, b, bld]) => { 
          setRooms(r); 
          setRoomTypes(t); 
          setBookings(b); 
          setBuildings(bld);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createRoom = async (data: Room) => {
    const room = await repositories.rooms.create(data);
    setRooms(prev => [...prev, room]);
    return room;
  };

  const batchCreateRooms = async (data: Room[]) => {
    const newRooms = await repositories.rooms.batchCreate(data);
    setRooms(prev => [...prev, ...newRooms]);
    return newRooms;
  };

  const updateRoom = async (id: string, data: Partial<Room>) => {
    const room = await repositories.rooms.update(id, data);
    setRooms(prev => prev.map(r => r.id === id ? room : r));
    return room;
  };

  const createType = async (data: Omit<RoomType, 'id'>) => {
    const type = await repositories.rooms.createType(data);
    setRoomTypes(prev => [...prev, type]);
    return type;
  };

  const deleteType = async (id: string) => {
    await repositories.rooms.deleteType(id);
    setRoomTypes(prev => prev.filter(t => t.id !== id));
  };

  const createBuilding = async (name: string) => {
    const building = await repositories.rooms.createBuilding(name);
    setBuildings(prev => [...prev, building]);
    return building;
  };

  return { rooms, roomTypes, deleteType, bookings, buildings, loading, error, createRoom, updateRoom, createType, createBuilding, batchCreateRooms };
}
