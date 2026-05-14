import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthData, Role } from '../types';
import { login as apiLogin, register as apiRegister } from '../api/authApi';

const DEMO_USERS: Record<string, AuthData> = {
  'admin@biblioteca.com':     { id: 1, token: 'demo-token', name: 'Administrador',  email: 'admin@biblioteca.com',    role: 'ADMIN' },
  'librarian@biblioteca.com': { id: 2, token: 'demo-token', name: 'Bibliotecario',  email: 'librarian@biblioteca.com', role: 'LIBRARIAN' },
  'reader@biblioteca.com':    { id: 3, token: 'demo-token', name: 'Juan Lector',    email: 'reader@biblioteca.com',   role: 'READER' },
};

let demoIdCounter = 100;

interface AuthContextType {
  user: AuthData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isNetworkErr = (err: unknown) =>
  !!(err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ERR_NETWORK');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    if (stored && token) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const persist = (data: AuthData) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const login = async (email: string, password: string) => {
    let data: AuthData;
    try {
      data = await apiLogin(email, password);
    } catch (err) {
      const demo = DEMO_USERS[email];
      if (isNetworkErr(err) && demo && password === 'password') {
        data = demo;
      } else {
        throw err;
      }
    }
    persist(data);
  };

  const register = async (name: string, email: string, password: string) => {
    let data: AuthData;
    try {
      data = await apiRegister(name, email, password);
    } catch (err) {
      if (isNetworkErr(err)) {
        if (DEMO_USERS[email]) throw new Error('Email ya registrado');
        data = { id: ++demoIdCounter, token: 'demo-token', name, email, role: 'READER' };
        DEMO_USERS[email] = data;
      } else {
        throw err;
      }
    }
    persist(data);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
