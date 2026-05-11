import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthData, Role } from '../types';
import { login as apiLogin } from '../api/authApi';

const DEMO_USERS: Record<string, AuthData> = {
  'admin@biblioteca.com':     { token: 'demo-token', id: 1, name: 'Administrador',  email: 'admin@biblioteca.com',    role: 'ADMIN' },
  'librarian@biblioteca.com': { token: 'demo-token', id: 2, name: 'Bibliotecario',  email: 'librarian@biblioteca.com', role: 'LIBRARIAN' },
  'reader@biblioteca.com':    { token: 'demo-token', id: 3, name: 'Juan Lector',    email: 'reader@biblioteca.com',   role: 'READER' },
};

interface AuthContextType {
  user: AuthData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    let data: AuthData;
    try {
      data = await apiLogin(email, password);
    } catch (err: unknown) {
      const isNetworkError = !!(err && typeof err === 'object' && 'code' in err &&
        (err as { code?: string }).code === 'ERR_NETWORK');
      const demo = DEMO_USERS[email];
      if (isNetworkError && demo && password === 'password') {
        data = demo;
      } else {
        throw err;
      }
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
