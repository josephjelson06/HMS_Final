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
