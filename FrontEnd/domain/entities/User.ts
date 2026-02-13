// User domain entities — pure TypeScript, no framework dependencies

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Disabled' | 'Inactive' | string;
  phone?: string;
  mobile?: string;
  lastLogin?: string;
  avatar?: string;
  dateAdded?: string;
}

export interface Role {
  id?: string;
  name: string;
  description?: string;
  desc?: string;
  permissions?: string[];
  userCount?: number;
  color?: string;
  status?: 'Active' | 'Inactive';
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | string;
  lastLogin: string;
  avatar?: string;
}
