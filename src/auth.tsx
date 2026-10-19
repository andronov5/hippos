import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, message, post } from './api';
import type { User } from './types';

type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<User | null>;
  logout: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User | null }>('/me');
      setUser(data.user);
      setError('');
      return data.user;
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);
  const logout = async () => {
    await post('/auth/logout', {});
    setUser(null);
  };
  return (
    <Context.Provider value={{ user, loading, error, refresh, logout }}>
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
export function Gate({
  children,
  admin = false,
  approved = true,
}: {
  children: ReactNode;
  admin?: boolean;
  approved?: boolean;
}) {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="page-loading" role="status">
        Opening your lab…
      </div>
    );
  if (error)
    return (
      <div className="empty-state">
        <h1>We couldn’t open your lab</h1>
        <p>{error}</p>
        <button className="button" onClick={() => refresh().catch(() => {})}>
          Try again
        </button>
      </div>
    );
  if (!user) return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/learn" replace />;
  if (approved && !user.approved) return <Navigate to="/application" replace />;
  return children;
}
