export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super' | 'hotel';
  hotelId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  isAuthenticated(): Promise<boolean>;
}
