export type BookingBlockStatus = 'confirmed' | 'checked-in' | 'overdue' | 'pending';

export interface BookingBlock {
  id: string;
  guestName: string;
  status: BookingBlockStatus;
  startDate: string;
  nights: number;
  roomId: string;
  balance: number;
  source: string;
}

export interface BookingRoom {
  id: string;
  type: string;
  floor: number;
}

/** Layout constants for the booking engine timeline */
export const BOOKING_CELL_WIDTH = 120;
export const BOOKING_ROOM_LIST_WIDTH = 280;
export const BOOKING_DAYS_TO_SHOW = 21;
export const BOOKING_ROW_HEIGHT = 80;
