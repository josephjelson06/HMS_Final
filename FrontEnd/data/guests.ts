// Mock data extracted from components/hotel/GuestRegistry.tsx

export type KYCStatus = 'Verified' | 'Pending' | 'Manual Review' | 'Failed';
export type GuestStatus = 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'No-Show';

export interface Guest {
  id: string;
  refId: string;
  name: string;
  mobile: string;
  email: string;
  room: string;
  roomCategory: string;
  checkIn: string;
  checkOut: string;
  kycStatus: KYCStatus;
  balance: number;
  status: GuestStatus;
  source: string;
  nationality: 'Indian' | 'Foreign';
  isReturning: boolean;
  visitCount?: number;
  checkedInAt?: string; 
}

export const mockGuests: Guest[] = [
  { id: '1', refId: 'BK-0042', name: 'Abhishek Sharma', mobile: '+91 99887 76655', email: 'abhishek.s@gmail.com', room: '305', roomCategory: 'Deluxe Double', checkIn: '09 Feb', checkOut: '11 Feb', kycStatus: 'Verified', balance: 0, status: 'Checked-In', source: 'Direct', nationality: 'Indian', isReturning: true, visitCount: 3, checkedInAt: '2026-02-09T10:00:00Z' },
  { id: '2', refId: 'BK-0912', name: 'Sarah Jenkins', mobile: '+1 415 555 0123', email: 'sarah.j@outlook.com', room: '608', roomCategory: 'Suite', checkIn: '10 Feb', checkOut: '15 Feb', kycStatus: 'Pending', balance: 12500, status: 'Checked-In', source: 'MMT', nationality: 'Foreign', isReturning: false, checkedInAt: '2026-02-10T08:15:00Z' },
  { id: '3', refId: 'BK-1102', name: 'Robert Mitchell', mobile: '+91 88776 65544', email: 'robert.m@gmail.com', room: '204', roomCategory: 'Standard', checkIn: '10 Feb', checkOut: '12 Feb', kycStatus: 'Manual Review', balance: 1593, status: 'Reserved', source: 'GoBiz', nationality: 'Indian', isReturning: false },
  { id: '4', refId: 'BK-5541', name: 'Priya Kapoor', mobile: '+91 77665 54433', email: 'p.kapoor@mmt.com', room: '105', roomCategory: 'Deluxe Single', checkIn: '08 Feb', checkOut: '11 Feb', kycStatus: 'Verified', balance: -500, status: 'Checked-Out', source: 'MMT', nationality: 'Indian', isReturning: true, visitCount: 2 },
  { id: '5', refId: 'BK-6677', name: 'Karan Johar', mobile: '+91 98223 34455', email: 'k.johar@external.com', room: '202', roomCategory: 'Deluxe Twin', checkIn: '11 Feb', checkOut: '14 Feb', kycStatus: 'Verified', balance: 0, status: 'Reserved', source: 'Direct', nationality: 'Indian', isReturning: false },
  { id: '6', refId: 'BK-8899', name: 'Anjali Rao', mobile: '+91 94455 66778', email: 'anjali.r@test.com', room: '310', roomCategory: 'Standard', checkIn: '09 Feb', checkOut: '12 Feb', kycStatus: 'Manual Review', balance: 4500, status: 'Checked-In', source: 'Agoda', nationality: 'Indian', isReturning: true, visitCount: 1 },
];
