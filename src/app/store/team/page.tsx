'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { UserPlus, Trash2, Shield, Truck, CreditCard, Crown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'STORE_OWNER' | 'CASHIER' | 'DRIVER';

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  isActive: boolean;
  joinedAt: string;
  lastActive?: string;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Shield; color: string; bg: string; perms: string[] }> = {
  STORE_OWNER: {
    label: 'Store Owner',
    icon: Crown,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    perms: ['Full access to all features', 'Manage team & permissions', 'View analytics & finance', 'Manage products & discounts'],
  },
  CASHIER: {
    label: 'Cashier',
    icon: CreditCard,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    perms: ['View & manage orders', 'Process payments', 'View finance & reconciliation', 'No product/team management'],
  },
  DRIVER: {
    label: 'Driver',
    icon: Truck,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    perms: ['View assigned deliveries', 'Update delivery status', 'Dashboard summary only', 'No financial access'],
  },
};

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'CASHIER' as Role });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/store/team', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['store-team'] }); onClose(); },
    onError: () => setError('Failed to add member. Please try again.'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add Team Member</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. James Kariuki"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+254700000000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email (optional)</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="james@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Role *</label>
            <div className="space-y-2">
              {(['CASHIER', 'DRIVER'] as Role[]).map(role => {
                const cfg = ROLE_CONFIG[role];
                const Icon = cfg.icon;
                return (
                  <button
                    key={role}
                    onClick={() => setForm(f => ({ ...f, role }))}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                      form.role === role ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                      <Icon size={16} className={cfg.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cfg.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cfg.perms[0]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => {
              if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone are required.'); return; }
              mutation.mutate(form);
            }}
            disabled={mutation.isPending}
            className="w-full py-3 bg-[#0f2d1f] text-white font-semibold rounded-xl hover:bg-[#1a4a30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [showAdd, setShowAdd] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['store-team'],
    queryFn: () => api.get('/store/team').then(r => r.data.data as TeamMember[]),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/store/team/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store-team'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/store/team/${id}`, { isActive }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store-team'] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const members = data ?? [];
  const owner = members.find(m => m.role === 'STORE_OWNER');
  const staff = members.filter(m => m.role !== 'STORE_OWNER');

  return (
    <div className="space-y-6">
      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team & Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f2d1f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4a30] transition-colors"
        >
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Role Permissions Guide */}
      <div className="grid sm:grid-cols-3 gap-3">
        {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={role} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <span className="font-semibold text-sm text-gray-800">{cfg.label}</span>
              </div>
              <ul className="space-y-1.5">
                {cfg.perms.map(p => (
                  <li key={p} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#10003;</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Owner */}
      {owner && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Store Owner</h2>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg flex-shrink-0">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{owner.name}</p>
              <p className="text-xs text-gray-400">{owner.phone}{owner.email ? ` · ${owner.email}` : ''}</p>
            </div>
            <RoleBadge role={owner.role} />
          </div>
        </div>
      )}

      {/* Staff */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Staff</h2>
          <span className="text-xs text-gray-400">{staff.length} member{staff.length !== 1 ? 's' : ''}</span>
        </div>
        {staff.length === 0 ? (
          <div className="p-8 text-center">
            <Shield size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No staff members yet</p>
            <p className="text-xs text-gray-300 mt-1">Add cashiers or drivers to give them access</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staff.map(member => (
              <div key={member.id} className="p-4 flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                  member.role === 'CASHIER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                )}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                    {!member.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{member.phone}</p>
                </div>
                <RoleBadge role={member.role} />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate({ id: member.id, isActive: !member.isActive })}
                    className={cn(
                      'text-xs px-2 py-1 rounded-lg font-medium transition-colors',
                      member.isActive
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    )}
                  >
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.name} from the team?`)) {
                        removeMutation.mutate(member.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
