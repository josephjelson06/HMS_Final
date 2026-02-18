import type { IAuthService, AuthUser, LoginCredentials } from '../../domain/contracts/IAuthService';
import { httpClient } from '../http/client';
import { setCookie } from '../browser/cookies';

export class ApiAuthService implements IAuthService {
  private currentUser: AuthUser | null = null;
  private readonly STORAGE_KEY = 'hms_user'; // Deprecated but kept for cleanup

  constructor() {
    // Clean up old storage if present
    if (typeof window !== 'undefined') {
       localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // POST /auth/login returns the user object and sets the HttpOnly cookie
      const response = await httpClient.post<any>('/auth/login', credentials);
      
      const role = response.user_type === 'platform' ? 'super' : 'hotel';

      const user: AuthUser = {
        id: response.id.toString(),
        name: response.name,
        email: response.email,
        role: role,
        permissions: response.permissions ?? [],
        // Map user_type/tenant fields if needed, but UI seems to rely on 'role' string or hotelId
        hotelId: response.tenant_id?.toString()
      };

      // If backend returns token in body, set it in client cookie as fallback
      if (response.access_token) {
          // Set with appropriate options matching backend's logic
          // IMPORTANT: Add "Bearer " prefix to match backend cookie format
          setCookie('access_token', `Bearer ${response.access_token}`, { 
              path: '/', 
              maxAgeSeconds: 60 * 60 * 24, // 1 day
              sameSite: 'lax' 
          });
      }

      this.currentUser = user;
      return user;
    } catch (error) {
       console.error("Login error", error);
       throw new Error('Invalid email or password');
    }
  }

  async logout(): Promise<void> {
    try {
        await httpClient.post('/auth/logout', {});
    } catch(e) {
        console.warn("Logout failed", e);
    }
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) return this.currentUser;
    
    try {
        // Fetch from /auth/me (cookie is sent automatically)
        const response = await httpClient.get<any>('/auth/me');
        
      const role = response.user_type === 'platform' ? 'super' : 'hotel';
      
      const user: AuthUser = {
        id: response.id.toString(),
        name: response.name,
        email: response.email,
        role: role,
        permissions: response.permissions ?? [],
        // Map user_type/tenant fields if needed, but UI seems to rely on 'role' string or hotelId
        hotelId: response.tenant_id?.toString()
      };
        this.currentUser = user;
        return user;
    } catch (error) {
        // Not authenticated
        return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
     if (this.currentUser) return true;
     const user = await this.getCurrentUser();
     return user !== null;
  }
}
