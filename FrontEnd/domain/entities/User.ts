// User domain entities — pure TypeScript, no framework dependencies
import type React from 'react';

export interface User {
  id: string;
  employeeId?: string; // Optional in types/user.ts
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
  id: string;
  name: string;
  description?: string;
  desc?: string; // Legacy support
  permissions: string[];
  userCount?: number;
  color?: string;
  status?: 'Active' | 'Inactive';
}

export interface PermissionAction {
  key: string;
  label: string;
  granted: boolean;
}

export interface PermissionModule {
  name: string;
  icon: React.ElementType; // Requires React import
  actions: PermissionAction[];
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

