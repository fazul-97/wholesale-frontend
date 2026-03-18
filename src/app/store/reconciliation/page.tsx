'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, Package, AlertCircle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReconciliationPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['store-reconciliation'],
    queryFn: () => api.get('/store/reconciliation').then(r => r.data.data),
  });

  if (isLoading || !data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const d = data;

  const chartData = d.dailyRecords.map((r: any) => ({
    date: r.date,
    Cash: r.cashAmount,
    'M-Pesa': r.mpesaAmount,
    Outstanding: r.outstanding,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Reconciliation</h1>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Package,       label: 'Delivered Today', value: d.summary.deliveredToday,               color: 'bg-blue-500',   text: '' },
          { icon: CheckCircle2,  label: 'Paid Today',      value: d.summary.paidToday,                    color: 'bg-green-500',  text: '' },
          { icon: DollarSign,    label: 'Cash Collected',  value: `KES ${d.summary.collectedCash.toLocaleString()}`,   color: 'bg-yellow-500', text: '' },
          { icon: DollarSign,    label: 'M-Pesa Collected',value: `KES ${d.summary.collectedMpesa.toLocaleString()}`,  color: 'bg-green-600',  text: '' },
          { icon: AlertCircle,   label: 'Outstanding',     value: `KES ${d.summary.outstanding.toLocaleString()}`,     color: 'bg-red-500',    text: '' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-tight">{label}</p>
              <p className="text-base font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stacked Bar Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Collections — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: unknown) => `KES ${Number(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="Cash"        stackId="a" fill="#f59e0b" radius={[0,0,0,0]} />
            <Bar dataKey="M-Pesa"      stackId="a" fill="#16a34a" radius={[0,0,0,0]} />
            <Bar dataKey="Outstanding" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Records Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Reconciliation</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date','Delivered','Paid','Cash','M-Pesa','Outstanding'].map(h => (
                  <th key={h} className="text-right first:text-left py-2 text-xs text-gray-400 font-medium px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.dailyRecords.map((r: any) => (
                <tr key={r.date} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-800">{r.date}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{r.delivered}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={cn('font-medium', r.paid === r.delivered ? 'text-green-600' : 'text-yellow-600')}>
                      {r.paid}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">KES {r.cashAmount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-700">KES {r.mpesaAmount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={cn('font-semibold', r.outstanding > 0 ? 'text-red-600' : 'text-green-600')}>
                      {r.outstanding > 0 ? `KES ${r.outstanding.toLocaleString()}` : '✓ Balanced'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outstanding Balances */}
      {d.outstandingBalances.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Outstanding Customer Balances</h2>
          <div className="space-y-3">
            {d.outstandingBalances.map((c: any) => (
              <div key={c.customer} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.customer}</p>
                  <p className="text-xs text-gray-400">{c.phone} · {c.orders} order{c.orders > 1 ? 's' : ''} · {c.lastOrder}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">KES {c.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{c.daysPending} day{c.daysPending > 1 ? 's' : ''} overdue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
