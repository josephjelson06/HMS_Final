// Auth domain entities - pure TypeScript, no framework dependencies

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super' | 'hotel' | string;
  roleName?: string;
  userType?: string;
  hotelId?: string;
  status?: string;
  mobile?: string;
  phone?: string;
  lastLogin?: string;
  avatar?: string;
  dateAdded?: string;
  permissions?: string[];
  employee_id?: string;
  isAdmin?: boolean;
  isOrphan?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  mobile?: string;
  password?: string;
}
