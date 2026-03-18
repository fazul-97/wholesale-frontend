'use client';
import Link from 'next/link';
import { ShoppingBag, Package, Tag, TrendingUp, Clock, CheckCircle, Truck, Loader2, BarChart2, DollarSign, ClipboardList, Users } from 'lucide-react';
import { useStoreOrders } from '@/hooks/useApi';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { fmt } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface Order { id: string; orderNumber: string; status: string; total: number; createdAt: string; customer: { name?: string | null; phone: string }; }

const STAT_STATUSES = [
  { key: 'PENDING', label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  { key: 'DISPATCHED', label: 'Dispatched', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  { key: 'DELIVERED', label: 'Delivered', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
];

export default function StoreDashboard() {
  const { data, isLoading } = useStoreOrders({ page: 1 });
  const { user } = useAuthStore();
  const orders: Order[] = data?.data || [];
  const totals = data?.totals || {};
  const isOwner = user?.role === 'STORE_OWNER';

  // Today's revenue from delivered
  const today = new Date().toDateString();
  const todayRevenue = orders
    .filter((o: Order) => o.status === 'DELIVERED' && new Date(o.createdAt).toDateString() === today)
    .reduce((sum: number, o: Order) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 5);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-gray-500">{fmt.date(new Date())}</p>
      </div>

      {/* Today's Revenue */}
      <div className="bg-navy rounded-2xl p-5 text-white">
        <p className="text-sm text-gray-300">Today&apos;s Revenue</p>
        <p className="text-3xl font-bold text-amber-400 mt-1">{fmt.currency(todayRevenue)}</p>
        <p className="text-xs text-gray-400 mt-1">From delivered orders today</p>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_STATUSES.map(({ key, label, icon: Icon, color }) => (
          <Link key={key} href={`/store/orders?status=${key}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-navy">{totals[key] ?? orders.filter((o: Order) => o.status === key).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/store/orders" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
          <ShoppingBag size={20} className="text-navy" />
          <span className="text-xs font-medium text-navy">Orders</span>
        </Link>
        <Link href="/store/products" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
          <Package size={20} className="text-navy" />
          <span className="text-xs font-medium text-navy">Products</span>
        </Link>
        <Link href="/store/discounts" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
          <Tag size={20} className="text-navy" />
          <span className="text-xs font-medium text-navy">Discounts</span>
        </Link>
        {isOwner && (
          <>
            <Link href="/store/analytics" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
              <BarChart2 size={20} className="text-emerald-600" />
              <span className="text-xs font-medium text-navy">Analytics</span>
            </Link>
            <Link href="/store/finance" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
              <DollarSign size={20} className="text-emerald-600" />
              <span className="text-xs font-medium text-navy">Finance</span>
            </Link>
            <Link href="/store/reconciliation" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
              <ClipboardList size={20} className="text-emerald-600" />
              <span className="text-xs font-medium text-navy">Reconcile</span>
            </Link>
            <Link href="/store/team" className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow col-span-3 sm:col-span-1">
              <Users size={20} className="text-emerald-600" />
              <span className="text-xs font-medium text-navy">Team</span>
            </Link>
          </>
        )}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy text-sm">Recent Orders</h2>
            <Link href="/store/orders" className="text-xs text-amber-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order: Order) => (
              <Link key={order.id} href={`/store/orders/${order.id}`}>
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-navy">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.customer?.name || order.customer?.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-bold text-amber-600">{fmt.currency(order.total)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
