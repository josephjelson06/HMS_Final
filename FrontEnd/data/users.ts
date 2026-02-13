// Mock data extracted from components/UsersManagement.tsx

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  dateAdded: string;
}

export interface Role {
  name: string;
  desc: string;
  color: string;
  userCount: number;
  status: 'Active' | 'Inactive';
}

export const INITIAL_USERS: User[] = [
  { id: 'U-9021', name: 'Aditya Sharma', email: 'aditya@atc.com', mobile: '+919886032101', role: 'Super Admin', status: 'Active', lastLogin: '12m ago', dateAdded: '12 Jun 2024' },
  { id: 'U-9022', name: 'Suman Rao', email: 'suman.f@atc.com', mobile: '+919123456789', role: 'Finance', status: 'Active', lastLogin: '2h ago', dateAdded: '05 Jul 2024' },
  { id: 'U-9023', name: 'Vijay Kumar', email: 'vijay.ops@atc.com', mobile: '+918877665544', role: 'Operations', status: 'Active', lastLogin: 'Yesterday', dateAdded: '20 Aug 2024' },
  { id: 'U-9024', name: 'Neha Singh', email: 'neha.s@atc.com', mobile: '+917766554433', role: 'Support', status: 'Inactive', lastLogin: '5d ago', dateAdded: '01 Oct 2024' },
];

export const INITIAL_ROLES: Role[] = [
  { name: 'Operations', desc: 'Kiosk fleet control, firmware deployment and hotel onboardings.', color: 'blue', userCount: 8, status: 'Active' },
  { name: 'Support', desc: 'Access to ticketing system and basic kiosk heartbeats.', color: 'emerald', userCount: 12, status: 'Active' },
];
