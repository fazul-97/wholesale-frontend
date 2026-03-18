'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    if (!user) { router.replace('/login'); return; }
    router.replace(user.role === 'STORE_OWNER' ? '/store' : '/dashboard');
  }, [mounted, _hasHydrated, user, router]);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
