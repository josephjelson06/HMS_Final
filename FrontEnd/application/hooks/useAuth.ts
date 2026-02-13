import { useState, useCallback } from 'react';
import type { AuthUser } from '../../domain/contracts/IAuthService';
import { authService } from '../../infrastructure/config/container';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authService.login({ email, password });
      setUser(authUser);
      setIsAuthenticated(true);
      return authUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Quick login for current SPA (preserves existing behavior)
  const quickLogin = useCallback((role: 'super' | 'hotel') => {
    const mockUser: AuthUser = {
      id: role === 'super' ? 'U-9021' : 'H-001',
      name: role === 'super' ? 'Aditya Sharma' : 'Hotel Manager',
      email: role === 'super' ? 'admin@atc.com' : 'front@hotel.com',
      role,
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    return mockUser;
  }, []);

  return { user, isAuthenticated, loading, error, login, logout, quickLogin };
}
