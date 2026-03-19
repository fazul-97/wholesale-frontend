'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

export const useRequestOtp = () =>
  useMutation({ mutationFn: (phone: string) => api.post('/auth/request-otp', { phone }).then(r => r.data) });

export const useRegister = () =>
  useMutation({
    mutationFn: (body: { name: string; businessName: string; phone: string }) =>
      api.post('/auth/register', body).then(r => r.data),
  });

export const useVerifyOtp = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { phone: string; code: string; name?: string; businessName?: string }) =>
      api.post('/auth/verify-otp', body).then(r => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/dashboard');
    },
  });
};

export const useStoreLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => api.post('/auth/store/login', body).then(r => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/store');
    },
  });
};

export const useLogout = () => {
  const { logout, refreshToken } = useAuthStore();
  const router = useRouter();
  return () => {
    if (refreshToken) api.post('/auth/logout', { refreshToken }).catch(() => {});
    logout();
    router.replace('/login');
  };
};
