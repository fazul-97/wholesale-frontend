'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    router.replace(user.role === 'STORE_OWNER' ? '/store' : '/dashboard');
  }, [user, router]);
  return <div className="min-h-screen bg-navy flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
}
