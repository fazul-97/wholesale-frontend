'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Tag, Store, BarChart2, DollarSign, ClipboardList, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

const ALL_NAV = [
  { href: '/store',               icon: LayoutDashboard, label: 'Dashboard',      roles: ['STORE_OWNER','CASHIER','DRIVER'] },
  { href: '/store/orders',        icon: ShoppingBag,     label: 'Orders',         roles: ['STORE_OWNER','CASHIER'] },
  { href: '/store/deliveries',    icon: Truck,           label: 'Deliveries',     roles: ['STORE_OWNER','DRIVER'] },
  { href: '/store/products',      icon: Package,         label: 'Products',       roles: ['STORE_OWNER'] },
  { href: '/store/analytics',     icon: BarChart2,       label: 'Analytics',      roles: ['STORE_OWNER'] },
  { href: '/store/finance',       icon: DollarSign,      label: 'Finance',        roles: ['STORE_OWNER','CASHIER'] },
  { href: '/store/reconciliation',icon: ClipboardList,   label: 'Reconciliation', roles: ['STORE_OWNER','CASHIER'] },
  { href: '/store/discounts',     icon: Tag,             label: 'Discounts',      roles: ['STORE_OWNER'] },
  { href: '/store/team',          icon: Users,           label: 'Team',           roles: ['STORE_OWNER'] },
];

const ROLE_LABELS: Record<string, string> = {
  STORE_OWNER: 'Owner',
  CASHIER: 'Cashier',
  DRIVER: 'Driver',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { user, _hasHydrated } = useAuthStore();

  const role = user?.role ?? '';
  const navItems = ALL_NAV.filter(n => n.roles.includes(role));

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user || !['STORE_OWNER','CASHIER','DRIVER'].includes(user.role)) {
      router.replace('/store/login');
    }
  }, [_hasHydrated, user, router]);

  if (!_hasHydrated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-[#0f2d1f] shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-emerald-400" />
            <div>
              <span className="font-bold text-white text-lg">Metro</span>
              <span className="font-bold text-emerald-400 text-lg"> Admin</span>
              {role && (
                <span className="ml-2 text-xs bg-emerald-500 text-white font-semibold px-2 py-0.5 rounded-full">
                  {ROLE_LABELS[role] ?? role}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.name && <span className="text-xs text-gray-400 hidden sm:block">{user.name}</span>}
            <button onClick={logout} className="text-xs text-gray-400 hover:text-amber-400 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-52 py-6 pr-4 gap-1 flex-shrink-0">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/store' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-[#0f2d1f] text-white' : 'text-gray-600 hover:bg-white hover:text-[#0f2d1f]'
              )}>
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

      {/* Mobile Bottom Nav — show max 5 items */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 md:hidden">
        <div className="flex">
          {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const active = href === '/store' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors',
                active ? 'text-emerald-600' : 'text-gray-400'
              )}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="truncate text-[10px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
