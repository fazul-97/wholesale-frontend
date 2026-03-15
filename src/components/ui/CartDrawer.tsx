'use client';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { fmt } from '@/lib/utils';

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, itemCount, subtotal, total, discountAmount, updateQty, removeItem } = useCartStore();

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative p-2 text-navy hover:text-amber-600 transition-colors">
        <ShoppingCart size={22} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-lg text-navy">Cart ({itemCount})</h2>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : items.map(item => (
                <div key={item.productId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-navy truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{fmt.currency(item.price)} / {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 bg-white border rounded-lg flex items-center justify-center hover:bg-amber-50"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm font-mono font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 bg-white border rounded-lg flex items-center justify-center hover:bg-amber-50"><Plus size={12} /></button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{fmt.currency(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 mt-0.5"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span><span>{fmt.currency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span><span>-{fmt.currency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span><span className="text-amber-600">{fmt.currency(total)}</span>
                </div>
                <Link href="/dashboard/cart" onClick={() => setOpen(false)}
                  className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-center py-3 rounded-xl transition-colors">
                  Checkout
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
