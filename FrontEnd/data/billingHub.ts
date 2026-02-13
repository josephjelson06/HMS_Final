// Mock data extracted from components/hotel/BillingHub.tsx

export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Void';

export interface InvoiceRecord {
  id: string;
  guestName: string;
  companyName?: string;
  companyGstin?: string;
  room: string;
  checkOutDate: string;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  bookingRef: string;
  rateAudited?: boolean;
}

export const mockInvoices: InvoiceRecord[] = [
  { id: 'INV-H-20260211-0087', guestName: 'Arjun Sharma', room: '305', checkOutDate: '11 Feb 2026', grandTotal: 13993, paidAmount: 12400, balance: 1593, status: 'Issued', bookingRef: 'BK-0042', rateAudited: true },
  { id: 'INV-H-20260211-0088', guestName: 'Sarah Jenkins', room: '608', checkOutDate: '15 Feb 2026', grandTotal: 25400, paidAmount: 0, balance: 25400, status: 'Draft', bookingRef: 'BK-0912', rateAudited: false },
  { id: 'INV-H-20260211-0089', guestName: 'Meera L.', companyName: 'Infosys Limited', companyGstin: '29AABCI1234P1Z5', room: '102', checkOutDate: '10 Feb 2026', grandTotal: 42560, paidAmount: 42560, balance: 0, status: 'Paid', bookingRef: 'CORP-8821', rateAudited: true },
  { id: 'INV-H-20260211-0090', guestName: 'Rahul Verma', room: '204', checkOutDate: '12 Feb 2026', grandTotal: 8400, paidAmount: 8400, balance: 0, status: 'Paid', bookingRef: 'BK-1102', rateAudited: true },
  { id: 'INV-H-20260211-0091', guestName: 'Priya Kapoor', room: '105', checkOutDate: '11 Feb 2026', grandTotal: 12200, paidAmount: 0, balance: 0, status: 'Void', bookingRef: 'BK-5541' },
];
