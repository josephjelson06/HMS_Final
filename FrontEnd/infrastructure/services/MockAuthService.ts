import type { IAuthService, AuthUser, LoginCredentials } from '../../domain/contracts/IAuthService';

export class MockAuthService implements IAuthService {
  private currentUser: AuthUser | null = null;

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate auth — in production this calls the real backend
    const mockUsers: Record<string, AuthUser> = {
      'admin@atc.com': { id: 'U-9021', name: 'Aditya Sharma', email: 'admin@atc.com', role: 'super' },
      'front@hotel.com': { id: 'H-001', name: 'Hotel Manager', email: 'front@hotel.com', role: 'hotel', hotelId: '1' },
    };

    const user = mockUsers[credentials.email];
    if (!user) throw new Error('Invalid credentials');

    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }
}
