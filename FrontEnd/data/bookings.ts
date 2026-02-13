// Mock data extracted from components/hotel/BookingEngine.tsx

export interface BookingBlock {
  id: string;
  guestName: string;
  status: 'confirmed' | 'checked-in' | 'overdue' | 'pending';
  startDate: string; // YYYY-MM-DD
  nights: number;
  roomId: string;
  balance: number;
  source: string;
}

export const ROOMS_DATA = [
  { id: '101', type: 'Standard', floor: 1 },
  { id: '102', type: 'Standard', floor: 1 },
  { id: '103', type: 'Deluxe', floor: 1 },
  { id: '104', type: 'Deluxe', floor: 1 },
  { id: '201', type: 'Executive Suite', floor: 2 },
  { id: '202', type: 'Executive Suite', floor: 2 },
  { id: '203', type: 'Standard', floor: 2 },
  { id: '204', type: 'Standard', floor: 2 },
  { id: '301', type: 'Standard', floor: 3 },
  { id: '302', type: 'Deluxe', floor: 3 },
  { id: '303', type: 'Deluxe', floor: 3 },
  { id: '401', type: 'Presidential', floor: 4 },
];

export const BOOKING_ENGINE_BOOKINGS: BookingBlock[] = [
  { id: 'b1', guestName: 'Arjun Sharma', status: 'checked-in', startDate: '2026-02-10', nights: 3, roomId: '103', balance: 0, source: 'Direct' },
  { id: 'b2', guestName: 'Sarah Jenkins', status: 'overdue', startDate: '2026-02-12', nights: 4, roomId: '201', balance: 12500, source: 'MMT' },
  { id: 'b3', guestName: 'Robert Mitchell', status: 'confirmed', startDate: '2026-02-14', nights: 2, roomId: '101', balance: 0, source: 'GoBiz' },
  { id: 'b4', guestName: 'Priya Kapoor', status: 'pending', startDate: '2026-02-11', nights: 2, roomId: '104', balance: 5500, source: 'Agoda' },
  { id: 'b5', guestName: 'Michael Chen', status: 'confirmed', startDate: '2026-02-16', nights: 3, roomId: '204', balance: 0, source: 'Booking.com' },
];

export const BOOKING_CELL_WIDTH = 120;
export const BOOKING_ROOM_LIST_WIDTH = 280;
export const BOOKING_DAYS_TO_SHOW = 21;
export const BOOKING_ROW_HEIGHT = 80;
