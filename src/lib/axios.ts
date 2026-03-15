import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from store
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('auth-store');
    if (raw) {
      try {
        const state = JSON.parse(raw) as { state?: { accessToken?: string } };
        const token = state?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch { /* ignore */ }
    }
  }
  return config;
});

// Auto-refresh on 401
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  r => r,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      if (!refreshing) {
        refreshing = (async () => {
          try {
            const raw = localStorage.getItem('auth-store');
            const state = JSON.parse(raw || '{}') as { state?: { refreshToken?: string } };
            const rt = state?.state?.refreshToken;
            if (!rt) return null;
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken: rt });
            const { accessToken, refreshToken } = res.data.data as { accessToken: string; refreshToken: string };
            // Patch store in localStorage
            const parsed = JSON.parse(raw || '{}') as { state?: Record<string, unknown> };
            if (parsed.state) { parsed.state.accessToken = accessToken; parsed.state.refreshToken = refreshToken; }
            localStorage.setItem('auth-store', JSON.stringify(parsed));
            return accessToken;
          } catch { return null; }
        })().finally(() => { refreshing = null; });
      }
      const newToken = await refreshing;
      if (!newToken) {
        localStorage.removeItem('auth-store');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      orig.headers.Authorization = `Bearer ${newToken}`;
      return api(orig);
    }
    return Promise.reject(error);
  }
);
