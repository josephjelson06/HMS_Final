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

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  isAuthenticated(): Promise<boolean>;
  updateMyProfile(profile: ProfileUpdatePayload): Promise<AuthUser>;
}
