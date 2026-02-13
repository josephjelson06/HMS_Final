import type React from 'react';

// User domain types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Disabled' | string;
  phone?: string;
  lastLogin?: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  userCount?: number;
}

export interface PermissionAction {
  key: string;
  label: string;
  granted: boolean;
}

export interface PermissionModule {
  name: string;
  icon: React.ElementType;
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
