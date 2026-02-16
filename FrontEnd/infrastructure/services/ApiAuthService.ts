import type { IAuthService, AuthUser, LoginCredentials } from '../../domain/contracts/IAuthService';
import { httpClient } from '../http/client';

export class ApiAuthService implements IAuthService {
  private currentUser: AuthUser | null = null;
  private readonly STORAGE_KEY = 'hms_user';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await httpClient.post<any>('api/auth/login', credentials);
      
      const user: AuthUser = {
        id: response.id.toString(),
        name: response.name,
        email: response.email,
        role: response.role as 'super' | 'hotel',
        hotelId: response.hotel_id?.toString()
      };

      this.currentUser = user;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
       throw new Error('Invalid email or password');
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }
}
