'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Truck, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED:  'bg-blue-100 text-blue-700',
  DISPATCHED: 'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100 text-green-700',
};

export default function DeliveriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['store-orders'],
    queryFn: () => api.get('/orders/store/all').then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const deliveries = (data ?? []).filter((o: any) =>
    ['CONFIRMED','DISPATCHED','DELIVERED'].includes(o.status)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Truck size={20} className="text-amber-500" />
        <h1 className="text-xl font-bold text-gray-900">Deliveries</h1>
        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          {deliveries.length} orders
        </span>
      </div>

      {deliveries.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Truck size={40} className="mx-auto mb-3 opacity-30" />
          <p>No deliveries right now</p>
        </div>
      )}

      <div className="space-y-3">
        {deliveries.map((o: any) => (
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-gray-400">{o.orderNumber}</p>
                <p className="font-semibold text-gray-900">{o.customer?.name}</p>
              </div>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_STYLES[o.status] ?? 'bg-gray-100 text-gray-600')}>
                {o.status}
              </span>
            </div>

            {o.address && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{o.address.line1}, {o.address.city}</span>
              </div>
            )}

            {o.customer?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Phone size={14} className="flex-shrink-0 text-gray-400" />
                <a href={`tel:${o.customer.phone}`} className="text-blue-600">{o.customer.phone}</a>
              </div>
            )}

            <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">{o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}</p>
              <p className="text-sm font-bold text-gray-900">KES {o.total?.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
