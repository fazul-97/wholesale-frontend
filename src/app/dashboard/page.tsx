'use client';
import { useState } from 'react';
import { Search, Filter, RotateCcw, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { RecommendedCarousel } from '@/components/ui/RecommendedCarousel';
import { useProducts, useLastOrder } from '@/hooks/useApi';
import { useCartStore } from '@/stores/cartStore';
import { useMe } from '@/hooks/useApi';
import { fmt } from '@/lib/utils';

const CATEGORIES = ['All', 'Flour & Grains', 'Oils & Fats', 'Beverages', 'Dairy', 'Household', 'Cleaning'];

interface Product { id: string; name: string; unit: string; price: number; salePrice?: number | null; imageUrl?: string | null; stockStatus: string; category?: string | null; }

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: me } = useMe();
  const { data: productsData, isLoading } = useProducts({ search: debouncedSearch || undefined, category: category || undefined });
  const { data: lastOrder } = useLastOrder();
  const { addItem, items } = useCartStore();

  const products: Product[] = productsData?.data || [];

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st);
    (window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const reorderLast = () => {
    if (!lastOrder?.items) return;
    lastOrder.items.forEach((item: { product: Product; requestedQty: number }) => {
      const inCart = items.find(i => i.productId === item.product.id);
      if (!inCart && item.product.stockStatus !== 'OUT_OF_STOCK') {
        addItem({ productId: item.product.id, name: item.product.name, unit: item.product.unit, price: item.product.salePrice ?? item.product.price, imageUrl: item.product.imageUrl ?? undefined });
      }
    });
  };

  return (
    <div>
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-navy">
          Hello, {me?.name || 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">What would you like today?</p>
      </div>

      {/* Last Order Banner */}
      {lastOrder && (
        <div className="bg-navy rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Last Order</p>
            <p className="text-gray-300 text-xs mt-0.5">
              {fmt.date(lastOrder.createdAt)} · {fmt.currency(lastOrder.total)}
            </p>
          </div>
          <button onClick={reorderLast} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-navy font-bold text-xs px-3 py-2 rounded-xl transition-colors">
            <RotateCcw size={12} /> Re-order
          </button>
        </div>
      )}

      {/* Recommendations */}
      <RecommendedCarousel />

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat === 'All' ? '' : cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              (cat === 'All' && !category) || category === cat
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Filter size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">No products found</p>
          <button onClick={() => { setSearch(''); setCategory(''); setDebouncedSearch(''); }} className="text-amber-500 text-sm mt-2 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
