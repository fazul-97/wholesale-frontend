import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  role: 'CUSTOMER' | 'STORE_OWNER';
  phone?: string;
  name?: string;
  email?: string;
  loyaltyPoints?: number;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setTokens: (a: string, r: string) => void;
  updateUser: (data: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof document !== 'undefined') {
          document.cookie = `auth-role=${user.role};path=/;max-age=${60 * 60 * 24 * 7}`;
        }
        set({ user, accessToken, refreshToken });
      },
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      updateUser: (data) => set(s => ({ user: s.user ? { ...s.user, ...data } : null })),
      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-role=;path=/;max-age=0';
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
