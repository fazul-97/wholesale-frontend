'use client';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { cn, STATUS_COLORS, fmt } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';

interface Product { id: string; name: string; unit: string; price: number; salePrice?: number | null; imageUrl?: string | null; stockStatus: string; category?: string | null; }

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQty } = useCartStore();
  const cartItem = items.find(i => i.productId === product.id);
  const qty = cartItem?.quantity || 0;
  const isOOS = product.stockStatus === 'OUT_OF_STOCK';
  const displayPrice = product.salePrice ?? product.price;

  const handleAdd = () => addItem({ productId: product.id, name: product.name, unit: product.unit, price: displayPrice, imageUrl: product.imageUrl ?? undefined });
  const handleInc = () => updateQty(product.id, qty + 1);
  const handleDec = () => updateQty(product.id, qty - 1);

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow', isOOS && 'opacity-60')}>
      <div className="relative aspect-square bg-gray-50">
        {product.imageUrl
          ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        }
        <span className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[product.stockStatus])}>
          {product.stockStatus.replace('_', ' ')}
        </span>
      </div>

      <div className="p-3">
        {product.category && <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{product.category}</p>}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-navy">{fmt.currency(displayPrice)}</span>
            <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
            {product.salePrice && <span className="ml-1.5 text-xs line-through text-gray-400">{fmt.currency(product.price)}</span>}
          </div>
        </div>

        <div className="mt-2">
          {qty === 0 ? (
            <button onClick={handleAdd} disabled={isOOS}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-navy font-semibold text-sm py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
              <Plus size={14} /> Add
            </button>
          ) : (
            <div className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-1.5 border border-amber-200">
              <button onClick={handleDec} className="text-navy hover:text-amber-600 transition-colors"><Minus size={16} /></button>
              <span className="font-bold text-navy font-mono">{qty}</span>
              <button onClick={handleInc} className="text-navy hover:text-amber-600 transition-colors"><Plus size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
