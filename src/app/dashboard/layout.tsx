'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, ShoppingBag, User, Package, ShoppingCart, ArrowRight } from 'lucide-react';
import { cn, fmt } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/orders', icon: Package, label: 'Orders' },
  { href: '/dashboard/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const { itemCount, total } = useCartStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user || user.role !== 'CUSTOMER') {
      router.replace('/login');
    }
  }, [_hasHydrated, user, router]);

  const isCartPage = pathname === '/dashboard/cart';

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
          {/* Cart icon in header */}
          <Link href="/dashboard/cart" className="relative p-2 text-white hover:text-amber-400 transition-colors">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-navy text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-32">
        {children}
      </main>

      {/* Floating Cart Bar — shown when cart has items & not already on cart page */}
      {itemCount > 0 && !isCartPage && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <Link
              href="/dashboard/cart"
              className="flex items-center justify-between bg-navy text-white rounded-2xl px-4 py-3.5 shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 rounded-xl w-9 h-9 flex items-center justify-center font-bold text-navy text-sm">
                  {itemCount}
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">View Cart</p>
                  <p className="text-xs text-gray-300 leading-tight">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 text-base">{fmt.currency(total)}</span>
                <ArrowRight size={16} className="text-amber-400" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-up">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            const isCart = href === '/dashboard/cart';
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors',
                  active ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {isCart && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
