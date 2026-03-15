import { cn, STATUS_COLORS } from '@/lib/utils';

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border', STATUS_COLORS[status] || 'bg-gray-100 text-gray-700')}>
      {status.replace('_', ' ')}
    </span>
  );
}
