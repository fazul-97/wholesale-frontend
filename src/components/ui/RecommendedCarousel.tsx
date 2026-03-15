'use client';
import { ProductCard } from './ProductCard';
import { useRecommended } from '@/hooks/useApi';

interface Product { id: string; name: string; unit: string; price: number; salePrice?: number | null; imageUrl?: string | null; stockStatus: string; category?: string | null }

export function RecommendedCarousel() {
  const { data, isLoading } = useRecommended();
  const products: Product[] = data || [];
  if (isLoading || !products.length) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">💡 You may have forgotten</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map(p => (
          <div key={p.id} className="flex-shrink-0 w-44">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
