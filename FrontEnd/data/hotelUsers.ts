// Mock data extracted from components/hotel/HotelUsers.tsx

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  dateAdded: string;
}

export interface HotelRole {
  name: string;
  desc: string;
  userCount: number;
  color: string;
  status: string;
}

export const mockStaff: StaffMember[] = [
  { id: 'S-7701', name: 'Riya Mehta', email: 'riya.m@sapphire-hospitality.com', mobile: '+919886032101', role: 'General Manager', status: 'Active', lastLogin: '12m ago', dateAdded: '12 Jan 2025' },
  { id: 'S-7702', name: 'Suresh Kumar', email: 'suresh.k@sapphire.com', mobile: '+919123456789', role: 'Housekeeping Lead', status: 'Active', lastLogin: '2h ago', dateAdded: '15 Jan 2025' },
  { id: 'S-7703', name: 'Meera Lakhani', email: 'meera.l@sapphire.com', mobile: '+918877665544', role: 'Front Desk Executive', status: 'Active', lastLogin: 'Yesterday', dateAdded: '20 Jan 2025' },
  { id: 'S-7704', name: 'Arjun V. Deshmukh', email: 'arjun.v@sapphire.com', mobile: '+917766554433', role: 'Night Auditor', status: 'Active', lastLogin: '10 Feb, 11:45 PM', dateAdded: '01 Feb 2026' },
  { id: 'S-7690', name: 'Karan Johar', email: 'k.johar@external-services.com', mobile: '+919822334455', role: 'Maintenance', status: 'Inactive', lastLogin: '15d ago', dateAdded: '10 Dec 2024' },
  { id: 'S-7691', name: 'Anjali Rao', email: 'anjali.r@hotel.com', mobile: '+919445566778', role: 'Front Desk', status: 'Active', lastLogin: '2h ago', dateAdded: '05 Jan 2025' },
  { id: 'S-7692', name: 'Rohan Verma', email: 'rohan.v@hotel.com', mobile: '+919112233445', role: 'Housekeeping', status: 'Active', lastLogin: '1d ago', dateAdded: '08 Jan 2025' },
];

export const rolesData: HotelRole[] = [
  { name: 'General Manager', desc: 'Total Property Oversight & Root Level Controls', userCount: 1, color: 'purple', status: 'Active' },
  { name: 'Front Desk Executive', desc: 'Guest Check-In/Out & Basic Billing Management', userCount: 4, color: 'blue', status: 'Active' },
  { name: 'Housekeeping', desc: 'Room Status Updates & Maintenance Incident Reporting', userCount: 12, color: 'emerald', status: 'Active' },
  { name: 'Night Auditor', desc: 'EndOfDay Operations & Revenue Reconciliation', userCount: 2, color: 'orange', status: 'Active' },
  { name: 'Maintenance', desc: 'Critical Infrastructure & Hardware Repair Access', userCount: 3, color: 'blue', status: 'Active' },
];
