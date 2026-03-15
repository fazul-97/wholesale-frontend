'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, MapPin, ChevronDown, Loader2, ShoppingCart, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAddresses, usePlaceOrder } from '@/hooks/useApi';
import { useMe } from '@/hooks/useApi';
import { DiscountInput } from '@/components/ui/DiscountInput';
import { LoyaltyToggle } from '@/components/ui/LoyaltyToggle';
import { fmt } from '@/lib/utils';
import Link from 'next/link';

interface Address { id: string; label?: string | null; line1: string; city: string; isDefault: boolean; }

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, total, discountAmount, loyaltyPointsToRedeem, updateQty, removeItem, clear: clearCart, discountCode } = useCartStore();
  const { data: addresses = [] } = useAddresses();
  const { data: me } = useMe();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [note, setNote] = useState('');
  const [placed, setPlaced] = useState(false);
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
    }, {
      onSuccess: () => {
        clearCart();
        setPlaced(true);
      },
    });
  };

  if (placed) return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-navy mb-2">Order Placed!</h2>
      <p className="text-gray-500 mb-6">We&apos;ll confirm your order shortly.</p>
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

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{fmt.currency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount ({discountCode})</span>
            <span>-{fmt.currency(discountAmount)}</span>
          </div>
        )}
        {loyaltyPointsToRedeem > 0 && (
          <div className="flex justify-between text-sm text-amber-600">
            <span>Loyalty Points ({loyaltyPointsToRedeem.toLocaleString()} pts)</span>
            <span>-{fmt.currency(loyaltyDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
          <span className="text-navy">Total</span>
          <span className="text-amber-600">{fmt.currency(total)}</span>
        </div>
      </div>

      {/* Place Order */}
      <button
        onClick={handlePlace}
        disabled={placeOrder.isPending || !addrId || items.length === 0}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-navy font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg"
      >
        {placeOrder.isPending ? (
          <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
        ) : (
          <>Place Order · {fmt.currency(total)}</>
        )}
      </button>
    </div>
  );
}
