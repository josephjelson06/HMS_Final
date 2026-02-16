import { useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../../domain/contracts/IAuthService';
import { authService } from '../../infrastructure/config/container';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Default to true while checking session
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkSession() {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    }
    checkSession();
  }, []);

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

  return { user, isAuthenticated, loading, error, login, logout };
}
