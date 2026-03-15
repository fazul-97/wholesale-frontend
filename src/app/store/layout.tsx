'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Tag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/store', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/store/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/store/products', icon: Package, label: 'Products' },
  { href: '/store/discounts', icon: Tag, label: 'Discounts' },
];

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user || user.role !== 'STORE_OWNER') {
      router.replace('/store/login');
    }
  }, [_hasHydrated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-navy shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-amber-400" />
            <span className="font-bold text-white text-lg">Metro Store</span>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-amber-400 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* Side Nav (desktop) + Bottom Nav (mobile) */}
      <div className="flex flex-1 max-w-4xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-48 py-6 pr-4 gap-1 flex-shrink-0">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/store' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', active ? 'bg-navy text-white' : 'text-gray-600 hover:bg-white hover:text-navy')}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-6 px-4 md:px-0 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 md:hidden">
        <div className="flex">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/store' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn('flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors', active ? 'text-amber-600' : 'text-gray-400')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
