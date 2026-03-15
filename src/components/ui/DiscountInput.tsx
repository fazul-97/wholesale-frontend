'use client';
import { useState } from 'react';
import { useValidateDiscount } from '@/hooks/useApi';
import { useCartStore } from '@/stores/cartStore';
import { Tag, CheckCircle, XCircle } from 'lucide-react';
import { fmt } from '@/lib/utils';

export function DiscountInput({ orderTotal }: { orderTotal: number }) {
  const [code, setCode] = useState('');
  const { discountCode, discountAmount, setDiscount } = useCartStore();
  const { mutate, isPending } = useValidateDiscount();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const apply = () => {
    if (!code.trim()) return;
    mutate({ code: code.trim(), orderTotal }, {
      onSuccess: (data: { valid: boolean; discountAmount: number; message: string }) => {
        setMsg({ text: data.message, ok: data.valid });
        if (data.valid) setDiscount(code.toUpperCase(), data.discountAmount);
      },
      onError: () => setMsg({ text: 'Failed to validate code', ok: false }),
    });
  };

  const clear = () => { setDiscount('', 0); setCode(''); setMsg(null); };

  if (discountCode) return (
    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 text-green-700">
        <CheckCircle size={16} />
        <span className="font-mono font-bold text-sm">{discountCode}</span>
        <span className="text-sm">— {fmt.currency(discountAmount)} off</span>
      </div>
      <button onClick={clear} className="text-red-500 hover:text-red-700"><XCircle size={16} /></button>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && apply()}
            placeholder="Discount code" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <button onClick={apply} disabled={isPending || !code.trim()}
          className="px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy/90 disabled:opacity-50 transition-colors">
          {isPending ? '...' : 'Apply'}
        </button>
      </div>
      {msg && (
        <p className={`flex items-center gap-1.5 text-xs ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>
          {msg.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}{msg.text}
        </p>
      )}
    </div>
  );
}
