'use client';
import { useState } from 'react';
import { User, Star, MapPin, Plus, Trash2, Check, Loader2, LogOut, Edit2 } from 'lucide-react';
import { useMe, useAddresses } from '@/hooks/useApi';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { fmt } from '@/lib/utils';

interface Address { id: string; label?: string | null; line1: string; line2?: string | null; city: string; county?: string | null; isDefault: boolean; instructions?: string | null; }

export default function ProfilePage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: addresses = [], isLoading: addrLoading } = useAddresses();
  const qc = useQueryClient();
  const logout = useLogout();
  const { user } = useAuthStore();

  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: '', line1: '', line2: '', city: '', county: '', instructions: '' });
  const [addrSaving, setAddrSaving] = useState(false);

  const saveName = async () => {
    setNameSaving(true);
    try { await api.put('/customers/me', { name }); qc.invalidateQueries({ queryKey: ['me'] }); setEditName(false); }
    catch { /* TODO: error toast */ }
    finally { setNameSaving(false); }
  };

  const saveAddress = async () => {
    setAddrSaving(true);
    try {
      await api.post('/customers/me/addresses', addrForm);
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddAddr(false);
      setAddrForm({ label: '', line1: '', line2: '', city: '', county: '', instructions: '' });
    } catch { /* TODO: error toast */ }
    finally { setAddrSaving(false); }
  };

  const deleteAddress = async (id: string) => {
    await api.delete(`/customers/me/addresses/${id}`);
    qc.invalidateQueries({ queryKey: ['addresses'] });
  };

  const setDefault = async (id: string) => {
    await api.patch(`/customers/me/addresses/${id}`, { isDefault: true });
    qc.invalidateQueries({ queryKey: ['addresses'] });
  };

  if (meLoading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center">
            <User size={24} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy">{me?.name || 'Customer'}</p>
            <p className="text-sm text-gray-500">{user?.phone}</p>
          </div>
          <button onClick={() => { setEditName(true); setName(me?.name || ''); }} className="p-2 text-gray-400 hover:text-navy">
            <Edit2 size={16} />
          </button>
        </div>

        {editName && (
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
            <button onClick={saveName} disabled={nameSaving} className="bg-amber-500 text-navy font-bold px-3 py-2 rounded-xl text-sm disabled:opacity-50">
              {nameSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => setEditName(false)} className="border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-500">✕</button>
          </div>
        )}

        {/* Loyalty Points */}
        <div className="mt-3 bg-amber-50 rounded-xl p-3 flex items-center gap-2">
          <Star size={18} className="text-amber-500 fill-amber-400" />
          <div>
            <p className="text-sm font-bold text-amber-700">{(me?.loyaltyPoints || 0).toLocaleString()} Loyalty Points</p>
            <p className="text-xs text-amber-600">≈ {fmt.currency((me?.loyaltyPoints || 0) * 0.01)} redeemable value</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-amber-500" />
            <h2 className="font-semibold text-navy text-sm">Delivery Addresses</h2>
          </div>
          <button onClick={() => setShowAddAddr(!showAddAddr)} className="text-amber-600 hover:text-amber-700">
            <Plus size={18} />
          </button>
        </div>

        {addrLoading ? (
          <div className="flex items-center justify-center py-6"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(addresses as Address[]).map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {a.label && <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{a.label}</p>}
                  <p className="text-sm text-navy">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                  <p className="text-xs text-gray-400">{a.city}{a.county ? `, ${a.county}` : ''}</p>
                  {a.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">Default</span>}
                </div>
                <div className="flex gap-2">
                  {!a.isDefault && (
                    <button onClick={() => setDefault(a.id)} title="Set default" className="text-gray-400 hover:text-amber-500 p-1">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteAddress(a.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {(addresses as Address[]).length === 0 && !showAddAddr && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">No addresses yet</div>
            )}
          </div>
        )}

        {/* Add Address Form */}
        {showAddAddr && (
          <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Address</p>
            {(['label', 'line1', 'line2', 'city', 'county', 'instructions'] as const).map(field => (
              <div key={field}>
                <input
                  value={addrForm[field]}
                  onChange={e => setAddrForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={{ label: 'Label (e.g. Home)', line1: 'Street address *', line2: 'Apt / Building', city: 'City / Town *', county: 'County', instructions: 'Delivery instructions' }[field]}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={saveAddress} disabled={addrSaving || !addrForm.line1 || !addrForm.city} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-navy font-bold py-2.5 rounded-xl text-sm transition-colors">
                {addrSaving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Save Address'}
              </button>
              <button onClick={() => setShowAddAddr(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 bg-white">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
