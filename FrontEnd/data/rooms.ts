// Mock data extracted from components/hotel/RoomManagement.tsx

export type RoomStatus = 'CLEAN_VACANT' | 'DIRTY_VACANT' | 'CLEAN_OCCUPIED' | 'DIRTY_OCCUPIED' | 'MAINTENANCE';
export type ViewMode = 'GRID' | 'TIMELINE' | 'TYPES';

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

export const mockRooms: Room[] = [
  // Building 01
  { id: '101', building: 'Building 01', floor: 1, category: 'Standard', status: 'CLEAN_VACANT', lastUpdate: '09:00 AM', type: 'Hostel Room', isDND: false },
  { id: '102', building: 'Building 01', floor: 1, category: 'Deluxe', status: 'CLEAN_OCCUPIED', guestName: 'Amit Shah', lastUpdate: '10:15 AM', type: 'Hostel Room' },
  { id: '103', building: 'Building 01', floor: 1, category: 'Classic', status: 'DIRTY_VACANT', lastUpdate: '11:00 AM', type: 'Hostel Room' },
  { id: '104', building: 'Building 01', floor: 1, category: 'Standard', status: 'CLEAN_VACANT', lastUpdate: '08:30 AM', type: 'Hostel Room' },
  { id: '202', building: 'Building 01', floor: 2, category: 'Deluxe-S', status: 'CLEAN_VACANT', lastUpdate: '03:15 PM', type: 'Hostel Room' },
  { id: '203', building: 'Building 01', floor: 2, category: 'Classic', status: 'DIRTY_OCCUPIED', guestName: 'Arjun Sharma', lastUpdate: '03:15 PM', type: 'Hostel Room', isDND: true },
  { id: '412', building: 'Building 01', floor: 4, category: 'Deluxe', status: 'MAINTENANCE', maintenanceNote: 'Plumbing - Pipe Burst', maintenanceETA: 'Tomorrow 2 PM', lastUpdate: '03:15 PM', type: 'Hostel Room', hasIncident: true },
  
  // Building 02
  { id: '310', building: 'Building 02', floor: 1, category: 'Standard', status: 'CLEAN_VACANT', lastUpdate: '09:00 AM', type: 'Hostel Room' },
  { id: '311', building: 'Building 02', floor: 1, category: 'Deluxe', status: 'CLEAN_VACANT', lastUpdate: '10:15 AM', type: 'Hostel Room' },
  { id: '314', building: 'Building 02', floor: 1, category: 'Deluxe-S', status: 'CLEAN_VACANT', lastUpdate: '11:00 AM', type: 'Hostel Room' },
];

export const INITIAL_BOOKINGS = [
  { id: 'b1', guestName: 'Arjun Sharma', status: 'checked-in', startDate: '2026-02-10', nights: 3, roomId: '102', balance: 0, source: 'Direct' },
  { id: 'b2', guestName: 'Sarah Jenkins', status: 'overdue', startDate: '2026-02-12', nights: 4, roomId: '203', balance: 12500, source: 'MMT' },
  { id: 'b3', guestName: 'Robert Mitchell', status: 'confirmed', startDate: '2026-02-14', nights: 2, roomId: '101', balance: 0, source: 'GoBiz' },
  { id: 'b4', guestName: 'Priya Kapoor', status: 'pending', startDate: '2026-02-11', nights: 2, roomId: '104', balance: 5500, source: 'Agoda' },
];

export const CELL_WIDTH = 140;
export const ROOM_LIST_WIDTH = 300;
export const DAYS_TO_SHOW = 21;
