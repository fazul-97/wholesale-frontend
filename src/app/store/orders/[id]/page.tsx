'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, MessageSquare, CheckCircle, Truck, XCircle, Loader2 } from 'lucide-react';
import { useStoreOrder, useConfirmOrder, useUpdateOrderStatus } from '@/hooks/useApi';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { QuantityDiff } from '@/components/ui/QuantityDiff';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { fmt } from '@/lib/utils';

interface OrderItem { id: string; product: { id: string; name: string; unit: string }; requestedQty: number; confirmedQty?: number | null; price: number; }
interface Order {
  id: string; orderNumber: string; status: string; createdAt: string;
  subtotal: number; total: number; discountAmount: number; loyaltyDiscount: number;
  note?: string | null; discountCode?: string | null;
  customer: { name?: string | null; phone: string; loyaltyPoints: number };
  address: { label?: string | null; line1: string; line2?: string | null; city: string };
  items: OrderItem[];
}

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; icon: React.ReactNode; color: string }[]> = {
  CONFIRMED: [{ next: 'DISPATCHED', label: 'Mark Dispatched', icon: <Truck size={14} />, color: 'bg-purple-600 hover:bg-purple-700 text-white' }],
  MODIFIED: [{ next: 'DISPATCHED', label: 'Mark Dispatched', icon: <Truck size={14} />, color: 'bg-purple-600 hover:bg-purple-700 text-white' }],
  DISPATCHED: [{ next: 'DELIVERED', label: 'Mark Delivered', icon: <CheckCircle size={14} />, color: 'bg-green-600 hover:bg-green-700 text-white' }],
  PENDING: [{ next: 'CANCELLED', label: 'Cancel Order', icon: <XCircle size={14} />, color: 'bg-red-100 hover:bg-red-200 text-red-700' }],
};

export default function StoreOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: order, isLoading } = useStoreOrder(id);
  const confirmOrder = useConfirmOrder(id);
  const updateStatus = useUpdateOrderStatus(id);
  const qc = useQueryClient();

  const [confirmedQtys, setConfirmedQtys] = useState<Record<string, number>>({});
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const o = order as Order | undefined;

  const initQtys = () => {
    if (!o) return;
    const init: Record<string, number> = {};
    o.items.forEach(item => { init[item.id] = item.confirmedQty ?? item.requestedQty; });
    setConfirmedQtys(init);
    setConfirming(true);
  };

  const submitConfirm = () => {
    const items = o!.items.map(item => ({ orderItemId: item.id, confirmedQty: confirmedQtys[item.id] ?? item.requestedQty }));
    confirmOrder.mutate(items, { onSuccess: () => setConfirming(false) });
  };

  const submitStatus = (next: string) => {
    updateStatus.mutate({ status: next });
  };

  const submitNote = async () => {
    setNoteLoading(true);
    try { await api.post(`/orders/store/${id}/notes`, { note: noteText }); qc.invalidateQueries({ queryKey: ['store-order', id] }); setNoteText(''); }
    catch { /* TODO: toast */ }
    finally { setNoteLoading(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;
  if (!o) return <div className="text-center py-20"><p className="text-gray-400">Order not found</p><Link href="/store/orders" className="text-amber-500 text-sm mt-2 inline-block">Back</Link></div>;

  const transitions = STATUS_TRANSITIONS[o.status] || [];

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/store/orders" className="p-2 -ml-2 text-gray-400 hover:text-navy">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-navy">#{o.orderNumber}</h1>
          <p className="text-xs text-gray-400">{fmt.datetime(o.createdAt)}</p>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer</p>
        <p className="font-semibold text-navy">{o.customer.name || 'Customer'}</p>
        <p className="text-sm text-gray-500">{o.customer.phone}</p>
        <p className="text-xs text-amber-600 mt-1">{o.customer.loyaltyPoints.toLocaleString()} loyalty points</p>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-amber-500" />
          <p className="text-sm font-semibold text-navy">Delivery Address</p>
        </div>
        <p className="text-sm text-gray-700">
          {o.address.label && <span className="font-medium">{o.address.label} — </span>}
          {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}, {o.address.city}
        </p>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-navy text-sm">Order Items</h2>
          {o.status === 'PENDING' && !confirming && (
            <button onClick={initQtys} className="text-xs text-amber-600 font-semibold hover:underline">
              Confirm / Adjust
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {o.items.map((item: OrderItem) => (
            <div key={item.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{item.product.name}</p>
                {confirming ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Req: {item.requestedQty} {item.product.unit}</span>
                    <span className="text-xs text-gray-300">→</span>
                    <input
                      type="number"
                      min={0}
                      value={confirmedQtys[item.id] ?? item.requestedQty}
                      onChange={e => setConfirmedQtys(p => ({ ...p, [item.id]: Number(e.target.value) }))}
                      className="w-16 border border-amber-300 rounded-lg px-2 py-0.5 text-xs text-center focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-gray-400">{item.product.unit}</span>
                  </div>
                ) : (
                  <QuantityDiff requested={item.requestedQty} confirmed={item.confirmedQty} unit={item.product.unit} />
                )}
              </div>
              <p className="text-sm font-bold">{fmt.currency(item.price * (item.confirmedQty ?? item.requestedQty))}</p>
            </div>
          ))}
        </div>

        {confirming && (
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <button
              onClick={submitConfirm}
              disabled={confirmOrder.isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-navy font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors"
            >
              {confirmOrder.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Confirm Order'}
            </button>
            <button onClick={() => setConfirming(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500">Cancel</button>
          </div>
        )}
      </div>

      {/* Note */}
      {o.note && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-gray-400" />
            <p className="text-sm font-semibold text-navy">Customer Note</p>
          </div>
          <p className="text-sm text-gray-600">{o.note}</p>
        </div>
      )}

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{fmt.currency(o.subtotal)}</span></div>
        {o.discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount {o.discountCode ? `(${o.discountCode})` : ''}</span><span>-{fmt.currency(o.discountAmount)}</span></div>}
        {o.loyaltyDiscount > 0 && <div className="flex justify-between text-sm text-amber-600"><span>Loyalty Discount</span><span>-{fmt.currency(o.loyaltyDiscount)}</span></div>}
        <div className="flex justify-between font-bold text-base border-t pt-2"><span className="text-navy">Total</span><span className="text-amber-600">{fmt.currency(o.total)}</span></div>
      </div>

      {/* Add Note to Order */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-navy text-sm mb-2">Add Store Note</h2>
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} placeholder="Internal note for this order..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none" />
        <button onClick={submitNote} disabled={noteLoading || !noteText.trim()} className="mt-2 bg-gray-100 hover:bg-gray-200 text-navy font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 transition-colors">
          {noteLoading ? <Loader2 size={14} className="animate-spin" /> : 'Save Note'}
        </button>
      </div>

      {/* Status Actions */}
      {transitions.length > 0 && (
        <div className="space-y-2">
          {transitions.map(({ next, label, icon, color }) => (
            <button key={next} onClick={() => submitStatus(next)} disabled={updateStatus.isPending} className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50 ${color}`}>
              {updateStatus.isPending ? <Loader2 size={16} className="animate-spin" /> : <>{icon} {label}</>}
            </button>
          ))}
        </div>
      )}

      {/* Cancel from any non-terminal state */}
      {!['DELIVERED', 'CANCELLED', 'PENDING'].includes(o.status) && (
        <button onClick={() => submitStatus('CANCELLED')} disabled={updateStatus.isPending} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-2xl transition-colors disabled:opacity-50 text-sm">
          <XCircle size={14} /> Cancel Order
        </button>
      )}
    </div>
  );
}
