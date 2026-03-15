'use client';
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { Star } from 'lucide-react';
import { fmt } from '@/lib/utils';

interface LoyaltyToggleProps { balance: number; orderTotal: number }

export function LoyaltyToggle({ balance, orderTotal }: LoyaltyToggleProps) {
  const { loyaltyPointsToRedeem, setLoyaltyRedeem } = useCartStore();
  const [enabled, setEnabled] = useState(loyaltyPointsToRedeem > 0);

  const maxRedeem = Math.min(balance, Math.floor(orderTotal * 0.2 / 0.01)); // max 20% discount
  const discount = loyaltyPointsToRedeem * 0.01;

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setLoyaltyRedeem(next ? maxRedeem : 0);
  };

  if (balance === 0) return null;

  return (
    <div className={`rounded-xl border-2 p-4 transition-colors ${enabled ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-amber-500 fill-amber-400" />
          <div>
            <p className="font-semibold text-sm text-navy">Use Loyalty Points</p>
            <p className="text-xs text-gray-500">Balance: <span className="font-bold text-amber-600">{balance.toLocaleString()} pts</span></p>
          </div>
        </div>
        <button onClick={toggle} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-amber-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {enabled && (
        <p className="mt-2 text-sm text-green-600 font-medium">
          ✓ Redeeming {maxRedeem.toLocaleString()} pts = {fmt.currency(discount)} off
        </p>
      )}
    </div>
  );
}
