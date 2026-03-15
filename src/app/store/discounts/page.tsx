'use client';
import { useState } from 'react';
import { Plus, Tag, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import { useDiscounts, useCreateDiscount, useToggleDiscount } from '@/hooks/useApi';
import { fmt } from '@/lib/utils';

interface Discount { id: string; code: string; description?: string | null; discountType: string; discountValue: number; minOrderAmount?: number | null; maxUsage?: number | null; usageCount: number; isActive: boolean; expiresAt?: string | null; }

const BLANK = { code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxUsage: '', expiresAt: '' };

export default function StoreDiscountsPage() {
  const { data: discounts = [], isLoading } = useDiscounts();
  const createDiscount = useCreateDiscount();
  const toggleDiscount = useToggleDiscount();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...BLANK });

  const save = () => {
    createDiscount.mutate({
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
      maxUsage: form.maxUsage ? parseInt(form.maxUsage) : undefined,
      expiresAt: form.expiresAt || undefined,
    }, { onSuccess: () => { setShowModal(false); setForm({ ...BLANK }); } });
  };

  const toggle = (d: Discount) => toggleDiscount.mutate({ id: d.id, isActive: !d.isActive });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-navy">Discount Codes</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-navy font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-amber-500" /></div>
      ) : (discounts as Discount[]).length === 0 ? (
        <div className="text-center py-16">
          <Tag size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">No discount codes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(discounts as Discount[]).map((d: Discount) => (
            <div key={d.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-colors ${d.isActive ? 'border-green-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-navy text-sm bg-gray-100 px-2 py-0.5 rounded-lg">{d.code}</span>
                    {d.isActive ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Disabled</span>}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {d.discountType === 'PERCENTAGE' ? `${d.discountValue}% off` : `${fmt.currency(d.discountValue)} off`}
                  </p>
                  {d.description && <p className="text-xs text-gray-400 mt-0.5">{d.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    {d.minOrderAmount && <span>Min: {fmt.currency(d.minOrderAmount)}</span>}
                    {d.maxUsage && <span>Limit: {d.usageCount}/{d.maxUsage} used</span>}
                    {!d.maxUsage && <span>{d.usageCount} times used</span>}
                    {d.expiresAt && <span>Expires: {fmt.date(d.expiresAt)}</span>}
                  </div>
                </div>
                <button onClick={() => toggle(d)} className={`p-1 ${d.isActive ? 'text-green-500' : 'text-gray-300'} hover:opacity-70 transition-opacity`}>
                  {d.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">New Discount Code</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Code *</label>
                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Summer discount 20% off" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Discount Type *</label>
                <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (KES)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(KES)'}
                </label>
                <input type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} placeholder={form.discountType === 'PERCENTAGE' ? '10' : '200'} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Minimum Order (KES)</label>
                <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} placeholder="1000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Max Uses</label>
                <input type="number" value={form.maxUsage} onChange={e => setForm(p => ({ ...p, maxUsage: e.target.value }))} placeholder="Leave blank for unlimited" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <button onClick={save} disabled={createDiscount.isPending || !form.code || !form.discountValue} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-navy font-bold py-3 rounded-xl transition-colors">
                {createDiscount.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Discount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
