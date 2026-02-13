// Room domain types

export type RoomStatus = 'CLEAN_VACANT' | 'DIRTY_VACANT' | 'CLEAN_OCCUPIED' | 'DIRTY_OCCUPIED' | 'MAINTENANCE';
export type RoomViewMode = 'GRID' | 'TIMELINE' | 'TYPES';

export interface Room {
  id: string;
  building: string;
  floor: number;
  category: string;
  status: RoomStatus;
  guestName?: string;
  lastUpdate: string;
  isDND?: boolean;
  hasIncident?: boolean;
  maintenanceNote?: string;
  maintenanceETA?: string;
  type: 'Hostel Room' | 'Apartment' | 'Hostel';
  housekeeper?: string;
}

export interface RoomType {
  id: string;
  name: string;
  rate: number;
  occupancy: number;
  units: number;
  amenities: string[];
}

export interface Booking {
  id: string;
  guestName: string;
  status: string;
  startDate: string;
  nights: number;
  roomId: string;
  balance: number;
  source: string;
}
