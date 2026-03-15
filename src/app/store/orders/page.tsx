'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { useStoreOrders } from '@/hooks/useApi';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { fmt } from '@/lib/utils';
import { Suspense } from 'react';

const STATUS_TABS = ['All', 'PENDING', 'CONFIRMED', 'MODIFIED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

interface Order { id: string; orderNumber: string; status: string; total: number; createdAt: string; customer: { name?: string | null; phone: string }; items: unknown[]; }

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useStoreOrders({ status: status || undefined, page });
  const orders: Order[] = data?.data || [];
  const totalPages = data?.pages || 1;

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-4">Incoming Orders</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setStatus(tab === 'All' ? '' : tab); setPage(1); }}
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
          <ShoppingBag size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No orders found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {orders.map((order: Order) => (
              <Link key={order.id} href={`/store/orders/${order.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-navy">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{fmt.datetime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{order.customer?.name || order.customer?.phone}</p>
                      <p className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="font-bold text-amber-600">{fmt.currency(order.total)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function StoreOrdersPage() {
  return <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-amber-500" /></div>}><OrdersContent /></Suspense>;
}
