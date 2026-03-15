'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { useMyOrders } from '@/hooks/useApi';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { fmt } from '@/lib/utils';

const STATUS_TABS = ['All', 'PENDING', 'CONFIRMED', 'MODIFIED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

interface Order { id: string; orderNumber: string; createdAt: string; total: number; status: string; items: { product: { name: string } }[]; }

export default function OrdersPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useMyOrders({ status: status || undefined });
  const orders: Order[] = data?.data || [];

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-4">My Orders</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setStatus(tab === 'All' ? '' : tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              (tab === 'All' && !status) || status === tab
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No orders yet</p>
          <Link href="/dashboard" className="text-amber-500 text-sm mt-2 inline-block hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-navy text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt.datetime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate max-w-[70%]">
                    {order.items.slice(0, 2).map((i: { product: { name: string } }) => i.product.name).join(', ')}
                    {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                  </p>
                  <p className="font-bold text-amber-600">{fmt.currency(order.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
