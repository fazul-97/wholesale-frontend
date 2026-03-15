'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, ShoppingBag, User, Package } from 'lucide-react';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/orders', icon: Package, label: 'Orders' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user || user.role !== 'CUSTOMER') {
      router.replace('/login');
    }
  }, [_hasHydrated, user, router]);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-navy shadow-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-400" />
            <div>
              <span className="font-bold text-white text-lg">Metro</span>
              <span className="font-bold text-amber-400 text-lg"> Wholesale</span>
            </div>
          </div>
          <CartDrawer />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-up">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn('flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors', active ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
