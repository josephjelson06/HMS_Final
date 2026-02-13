// Mock data extracted from components/hotel/HotelAudit.tsx

export type HotelActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'CHECKOUT' | 'VOID' | 'REFUND' | 'SHIFT_CLOSE' | 'NIGHT_AUDIT';
export type HotelModule = 'Guest Registry' | 'Room Management' | 'Billing' | 'Kiosk Settings' | 'Staff Management' | 'System';

export interface HotelAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  isImpersonated: boolean;
  action: HotelActionType;
  module: HotelModule;
  description: string;
  ip: string;
}

export const mockHotelLogs: HotelAuditEntry[] = [
  { id: 'h-log-final', timestamp: '11 Feb 2026, 12:05:00 AM', user: 'Arjun V.', isImpersonated: false, action: 'NIGHT_AUDIT', module: 'System', description: 'NIGHT AUDIT COMPLETED: Rolled business day from Feb 10 to Feb 11. Consolidated Audit Report (CAR) generated.', ip: '106.21.33.12' },
  { id: 'h-log-1', timestamp: '10 Feb 2026, 04:12:05 PM', user: 'Riya Mehta', isImpersonated: false, action: 'CHECKOUT', module: 'Billing', description: 'Settled final bill and completed checkout for Booking BK-0042 (Room 305)', ip: '106.21.33.2' },
  { id: 'h-log-2', timestamp: '10 Feb 2026, 03:45:12 PM', user: 'Vikram Patel', isImpersonated: true, action: 'UPDATE', module: 'Room Management', description: 'Overrode room status for Room 412 from Maintenance to Dirty_Vacant', ip: '192.168.1.45' },
  { id: 'h-log-3', timestamp: '10 Feb 2026, 02:20:33 PM', user: 'Suresh Kumar', isImpersonated: false, action: 'UPDATE', module: 'Room Management', description: 'Assigned Meera L. as housekeeper for Floor 3 block', ip: '106.21.33.15' },
  { id: 'h-log-4', timestamp: '10 Feb 2026, 11:15:00 AM', user: 'Meera L.', isImpersonated: false, action: 'CREATE', module: 'Guest Registry', description: 'Created new walk-in reservation for Arjun Sharma — Room 102', ip: '106.21.33.4' },
  { id: 'h-log-5', timestamp: '10 Feb 2026, 09:30:22 AM', user: 'Riya Mehta', isImpersonated: false, action: 'VOID', module: 'Billing', description: 'Voided duplicate POS bill #POS-8821 for Room 305', ip: '106.21.33.2' },
  { id: 'h-log-6', timestamp: '10 Feb 2026, 08:00:10 AM', user: 'Meera L.', isImpersonated: false, action: 'LOGIN', module: 'Staff Management', description: 'Staff shift login — Desk Terminal 1', ip: '106.21.33.4' },
  { id: 'h-log-7', timestamp: '09 Feb 2026, 06:44:11 PM', user: 'Riya Mehta', isImpersonated: false, action: 'REFUND', module: 'Billing', description: 'Issued manual refund of ₹1,200 to guest Sarah Jenkins (Reason: Service Recovery)', ip: '106.21.33.2' },
];
