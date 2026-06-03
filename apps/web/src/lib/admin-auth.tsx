'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, type Article, type Frequency, type Program, type RankingTrack, type User } from '@/lib/api';

type AdminData = {
  articles: Article[];
  programs: Program[];
  ranking: RankingTrack[];
  frequencies: Frequency[];
  users: User[];
};

type AuthContext = {
  token: string;
  user: User | null;
  adminData: AdminData;
  loading: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshContent: () => Promise<void>;
};

const AuthCtx = createContext<AuthContext | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminData, setAdminData] = useState<AdminData>({
    articles: [], programs: [], ranking: [], frequencies: [], users: []
  });

  useEffect(() => {
    const savedToken = window.localStorage.getItem('radioLabranzaAdminToken');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);
    api.me(savedToken)
      .then((currentUser) => {
        setUser(currentUser);
        return refreshAll(savedToken, currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem('radioLabranzaAdminToken');
        setToken('');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function refreshAll(nextToken = token, currentUser = user) {
    if (!nextToken) return;
    try {
      const [articles, programs, ranking, frequencies, users] = await Promise.all([
        api.adminArticles(nextToken),
        api.adminPrograms(nextToken),
        api.ranking(),
        api.adminFrequencies(nextToken),
        currentUser?.role === 'ADMIN' ? api.users(nextToken) : Promise.resolve([])
      ]);
      setAdminData({ articles, programs, ranking, frequencies, users });
    } catch {
      // silent
    }
  }

  const refreshContent = useCallback(async () => {
    await refreshAll();
  }, [token, user]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    setToken(response.accessToken);
    setUser(response.user);
    window.localStorage.setItem('radioLabranzaAdminToken', response.accessToken);
    await refreshAll(response.accessToken, response.user);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('radioLabranzaAdminToken');
    setToken('');
    setUser(null);
    setAdminData({ articles: [], programs: [], ranking: [], frequencies: [], users: [] });
  }, []);

  const value = useMemo(() => ({
    token, user, adminData, loading, saving, setSaving,
    login, logout, refreshContent
  }), [token, user, adminData, loading, saving, login, logout, refreshContent]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
