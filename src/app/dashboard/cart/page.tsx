'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, MapPin, ChevronDown, Loader2, ShoppingCart, CheckCircle, Smartphone, Banknote } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAddresses, usePlaceOrder } from '@/hooks/useApi';
import { useMe } from '@/hooks/useApi';
import { DiscountInput } from '@/components/ui/DiscountInput';
import { LoyaltyToggle } from '@/components/ui/LoyaltyToggle';
import { fmt } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Address { id: string; label?: string | null; line1: string; city: string; isDefault: boolean; }
type PaymentMethod = 'MPESA' | 'CASH';

function MpesaModal({ total, phone, onDone }: { total: number; phone: string; onDone: () => void }) {
  const [step, setStep] = useState<'prompt' | 'waiting' | 'success'>('prompt');
  const short = phone.replace(/^\+254/, '0');
  const txnId = 'QKJ' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const simulate = () => {
    setStep('waiting');
    setTimeout(() => setStep('success'), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-green-600 p-5 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Smartphone size={28} />
          </div>
          <p className="font-bold text-lg">M-Pesa Payment</p>
          <p className="text-green-100 text-sm mt-0.5">{fmt.currency(total)}</p>
        </div>
        <div className="p-5 text-center space-y-4">
          {step === 'prompt' && (
            <>
              <p className="text-gray-700 text-sm leading-relaxed">
                An STK push will be sent to <span className="font-bold text-gray-900">{short}</span>.<br />
                Enter your M-Pesa PIN when prompted.
              </p>
              <div className="bg-green-50 rounded-xl p-3 text-left text-xs text-green-800">
                <p className="font-semibold mb-1">Demo Mode</p>
                <p>Simulates Safaricom Daraja STK Push. In production, a real PIN prompt is sent to the customer&apos;s phone.</p>
              </div>
              <button onClick={simulate} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                Send STK Push
              </button>
            </>
          )}
          {step === 'waiting' && (
            <>
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-700 text-sm font-medium">Waiting for M-Pesa confirmation...</p>
              <p className="text-gray-400 text-xs">Check your phone and enter your PIN</p>
            </>
          )}
          {step === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} className="text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Payment Confirmed!</p>
                <p className="text-sm text-gray-500 mt-1">M-Pesa payment of <strong>{fmt.currency(total)}</strong> received</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-left text-xs text-gray-600 space-y-1">
                <p><span className="text-gray-400">Transaction ID: </span><span className="font-mono font-bold">{txnId}</span></p>
                <p><span className="text-gray-400">Account: </span>Metro Wholesale</p>
              </div>
              <button onClick={onDone} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                View My Orders
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, total, discountAmount, loyaltyPointsToRedeem, updateQty, removeItem, clear: clearCart, discountCode } = useCartStore();
  const { data: addresses = [] } = useAddresses();
  const { data: me } = useMe();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA');
  const [placed, setPlaced] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const placeOrder = usePlaceOrder();

  const defaultAddr = addresses.find((a: Address) => a.isDefault) || addresses[0];
  const addrId = selectedAddressId || defaultAddr?.id || '';
  const loyaltyDiscount = loyaltyPointsToRedeem * 0.01;

  const handlePlace = () => {
    if (!addrId) return;
    placeOrder.mutate({
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      addressId: addrId,
      discountCode: discountCode || undefined,
      loyaltyPointsToRedeem: loyaltyPointsToRedeem || undefined,
      note: note || undefined,
      paymentMethod,
    }, {
      onSuccess: () => {
        clearCart();
        if (paymentMethod === 'MPESA') {
          setShowMpesa(true);
        } else {
          setPlaced(true);
        }
      },
    });
  };

  if (placed) return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-navy mb-2">Order Placed!</h2>
      <p className="text-gray-500 mb-2">Payment: <span className="font-semibold">Cash on Delivery</span></p>
      <p className="text-gray-400 text-sm mb-6">Please have the exact amount ready for our driver.</p>
      <Link href="/dashboard/orders" className="bg-amber-500 hover:bg-amber-600 text-navy font-bold px-6 py-3 rounded-xl transition-colors">
        View Orders
      </Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <ShoppingCart size={56} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-navy mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add products to get started</p>
      <Link href="/dashboard" className="bg-amber-500 hover:bg-amber-600 text-navy font-bold px-6 py-3 rounded-xl transition-colors">
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {showMpesa && (
        <MpesaModal
          total={total}
          phone={me?.phone || '+254700000000'}
          onDone={() => { setShowMpesa(false); router.push('/dashboard/orders'); }}
        />
      )}

      <h1 className="text-xl font-bold text-navy">Checkout</h1>

      {/* Cart Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-navy text-sm">Items ({items.length})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-navy truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{fmt.currency(item.price)} / {item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 bg-gray-100 hover:bg-amber-100 rounded-lg flex items-center justify-center transition-colors">
                  <Minus size={12} />
                </button>
                <span className="w-7 text-center text-sm font-bold font-mono">{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 bg-gray-100 hover:bg-amber-100 rounded-lg flex items-center justify-center transition-colors">
                  <Plus size={12} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{fmt.currency(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-amber-500" />
          <h2 className="font-semibold text-navy text-sm">Delivery Address</h2>
        </div>
        {addresses.length === 0 ? (
          <div className="text-sm text-gray-500">
            No addresses saved.{' '}
            <Link href="/dashboard/profile" className="text-amber-600 font-semibold">Add one →</Link>
          </div>
        ) : (
          <div className="relative">
            <select
              value={addrId}
              onChange={e => setSelectedAddressId(e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 pr-8"
            >
              {addresses.map((a: Address) => (
                <option key={a.id} value={a.id}>
                  {a.label ? `${a.label} — ` : ''}{a.line1}, {a.city}{a.isDefault ? ' (Default)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-navy text-sm mb-3">Payment Method</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: 'MPESA' as PaymentMethod, label: 'M-Pesa', sub: 'Pay via STK push', icon: Smartphone, active: 'border-green-500 bg-green-50', badge: 'bg-green-500', iconBg: 'bg-green-500' },
            { id: 'CASH'  as PaymentMethod, label: 'Cash',   sub: 'Pay on delivery',  icon: Banknote,   active: 'border-amber-500 bg-amber-50', badge: 'bg-amber-500', iconBg: 'bg-amber-500' },
          ]).map(({ id, label, sub, icon: Icon, active, badge, iconBg }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={cn('flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all', paymentMethod === id ? active : 'border-gray-100 hover:border-gray-200')}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', paymentMethod === id ? iconBg : 'bg-gray-100')}>
                <Icon size={20} className={paymentMethod === id ? 'text-white' : 'text-gray-400'} />
              </div>
              <div className="text-center">
                <p className={cn('text-sm font-bold', paymentMethod === id ? 'text-gray-900' : 'text-gray-600')}>{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              {paymentMethod === id && <span className={cn('text-xs text-white px-2 py-0.5 rounded-full font-semibold', badge)}>Selected</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Code */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-navy text-sm mb-3">Discount Code</h2>
        <DiscountInput orderTotal={subtotal} />
      </div>

      {/* Loyalty Points */}
      {me?.loyaltyPoints > 0 && (
        <LoyaltyToggle balance={me.loyaltyPoints} orderTotal={subtotal} />
      )}

      {/* Order Note */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-navy text-sm mb-2">Order Note (optional)</h2>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Any special instructions..."
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmt.currency(subtotal)}</span></div>
        {discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount ({discountCode})</span><span>-{fmt.currency(discountAmount)}</span></div>}
        {loyaltyPointsToRedeem > 0 && <div className="flex justify-between text-sm text-amber-600"><span>Loyalty ({loyaltyPointsToRedeem.toLocaleString()} pts)</span><span>-{fmt.currency(loyaltyDiscount)}</span></div>}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Payment</span>
          <span className={cn('font-semibold', paymentMethod === 'MPESA' ? 'text-green-600' : 'text-amber-600')}>
            {paymentMethod === 'MPESA' ? '📱 M-Pesa' : '💵 Cash on Delivery'}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
          <span className="text-navy">Total</span>
          <span className="text-amber-600">{fmt.currency(total)}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlace}
        disabled={placeOrder.isPending || !addrId || items.length === 0}
        className={cn(
          'w-full font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg disabled:bg-gray-200 disabled:text-gray-400',
          paymentMethod === 'MPESA' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-navy'
        )}
      >
        {placeOrder.isPending ? (
          <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
        ) : paymentMethod === 'MPESA' ? (
          <><Smartphone size={18} /> Pay {fmt.currency(total)} via M-Pesa</>
        ) : (
          <><Banknote size={18} /> Place Order · {fmt.currency(total)}</>
        )}
      </button>
    </div>
  );
}
