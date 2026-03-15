'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, MessageSquare, Star, Loader2 } from 'lucide-react';
import { useOrder } from '@/hooks/useApi';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { QuantityDiff } from '@/components/ui/QuantityDiff';
import { fmt } from '@/lib/utils';

interface OrderItem { id: string; product: { name: string; unit: string }; requestedQty: number; confirmedQty?: number | null; price: number; }
interface Order {
  id: string; orderNumber: string; status: string; createdAt: string; updatedAt: string;
  subtotal: number; total: number; discountAmount: number; loyaltyDiscount: number;
  loyaltyPointsEarned: number; discountCode?: string | null; note?: string | null;
  address: { label?: string | null; line1: string; line2?: string | null; city: string; };
  items: OrderItem[];
  statusHistory?: { status: string; createdAt: string; note?: string | null }[];
}

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-amber-500" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Order not found</p>
      <Link href="/dashboard/orders" className="text-amber-500 text-sm mt-2 inline-block">Back to orders</Link>
    </div>
  );

  const o = order as Order;
  const stepIndex = ORDER_STEPS.indexOf(o.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="p-2 -ml-2 text-gray-400 hover:text-navy">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-navy">#{o.orderNumber}</h1>
      </div>

      {/* Status + Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400">{fmt.datetime(o.createdAt)}</p>
          </div>
          <OrderStatusBadge status={o.status} />
        </div>

        {/* Stepper — hide for MODIFIED / CANCELLED */}
        {!['MODIFIED', 'CANCELLED'].includes(o.status) && (
          <div className="flex items-center gap-0">
            {ORDER_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= stepIndex ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                {i < ORDER_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-navy' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}
        {!['MODIFIED', 'CANCELLED'].includes(o.status) && (
          <div className="flex mt-1">
            {ORDER_STEPS.map(step => (
              <div key={step} className="flex-1 last:flex-none">
                <p className="text-[10px] text-gray-400 capitalize">{step.charAt(0) + step.slice(1).toLowerCase()}</p>
              </div>
            ))}
          </div>
        )}

        {o.status === 'MODIFIED' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-2">
            <p className="text-sm text-orange-700 font-medium">⚠️ Order was modified by the store</p>
            <p className="text-xs text-orange-600 mt-0.5">Some quantities were adjusted. Check items below.</p>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={16} className="text-amber-500" />
          <h2 className="font-semibold text-navy text-sm">Delivery Address</h2>
        </div>
        <p className="text-sm text-gray-700">
          {o.address.label && <span className="font-medium">{o.address.label} — </span>}
          {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}, {o.address.city}
        </p>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-navy text-sm">Order Items</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {o.items.map((item: OrderItem) => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{item.product.name}</p>
                <div className="mt-0.5">
                  <QuantityDiff requested={item.requestedQty} confirmed={item.confirmedQty} unit={item.product.unit} />
                </div>
              </div>
              <p className="text-sm font-bold text-right">{fmt.currency(item.price * (item.confirmedQty ?? item.requestedQty))}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      {o.note && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <MessageSquare size={14} className="text-gray-400" />
            <h2 className="font-semibold text-navy text-sm">Order Note</h2>
          </div>
          <p className="text-sm text-gray-600">{o.note}</p>
        </div>
      )}

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>{fmt.currency(o.subtotal)}</span>
        </div>
        {o.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount {o.discountCode ? `(${o.discountCode})` : ''}</span>
            <span>-{fmt.currency(o.discountAmount)}</span>
          </div>
        )}
        {o.loyaltyDiscount > 0 && (
          <div className="flex justify-between text-sm text-amber-600">
            <span>Loyalty Discount</span>
            <span>-{fmt.currency(o.loyaltyDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span className="text-navy">Total</span>
          <span className="text-amber-600">{fmt.currency(o.total)}</span>
        </div>
        {o.loyaltyPointsEarned > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-1">
            <Star size={12} className="fill-amber-400" />
            <span>You earned <strong>{o.loyaltyPointsEarned.toLocaleString()} loyalty points</strong> on this order</span>
          </div>
        )}
      </div>
    </div>
  );
}
