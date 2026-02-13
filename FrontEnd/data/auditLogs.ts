// Mock data extracted from components/AuditLogs.tsx

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPERSONATE' | 'EXPORT';
  module: string;
  description: string;
  ip: string;
  isImpersonated: boolean;
  impersonationDetail?: string;
}

export const mockLogs: AuditEntry[] = [
  { id: 'log-1', timestamp: '09 Feb 2026, 10:32:45 AM', user: 'Vikram Patel', action: 'UPDATE', module: 'Hotel Registry', description: 'Changed Hotel Royal status from Active to Suspended', ip: '106.213.12.44', isImpersonated: false },
  { id: 'log-2', timestamp: '09 Feb 2026, 09:15:20 AM', user: 'Aditya Sharma', action: 'EXPORT', module: 'Reports', description: 'Exported Revenue Report (CSV) for Q1-2026', ip: '45.112.33.91', isImpersonated: false },
  { id: 'log-3', timestamp: '09 Feb 2026, 08:44:11 AM', user: 'Vijay Kumar', action: 'IMPERSONATE', module: 'Hotel Dashboard', description: 'Updated room inventory for Room 402', ip: '152.58.11.2', isImpersonated: true, impersonationDetail: 'Hotel Royal' },
  { id: 'log-4', timestamp: '08 Feb 2026, 11:55:02 PM', user: 'Suman Rao', action: 'LOGIN', module: 'Auth', description: 'System Login (MFA Verified)', ip: '202.144.9.18', isImpersonated: false },
  { id: 'log-5', timestamp: '08 Feb 2026, 04:30:00 PM', user: 'Vikram Patel', action: 'DELETE', module: 'Kiosk Fleet', description: 'Decommissioned Kiosk ATC-K-0222', ip: '106.213.12.44', isImpersonated: false },
  { id: 'log-6', timestamp: '08 Feb 2026, 02:12:33 PM', user: 'Neha Singh', action: 'CREATE', module: 'Users Management', description: 'Invited new team member: karan@atc.com', ip: '182.77.4.55', isImpersonated: false },
  { id: 'log-7', timestamp: '08 Feb 2026, 11:00:15 AM', user: 'Aditya Sharma', action: 'UPDATE', module: 'Plans', description: 'Modified Professional Plan pricing to ₹12,999', ip: '45.112.33.91', isImpersonated: false },
  { id: 'log-8', timestamp: '07 Feb 2026, 05:22:44 PM', user: 'Vikram Patel', action: 'IMPERSONATE', module: 'Invoices', description: 'Voided Invoice #INV-2026-01-0012', ip: '106.213.12.44', isImpersonated: true, impersonationDetail: 'Lemon Tree Premier' },
];
