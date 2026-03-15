'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const METHOD_COLORS: Record<string, string> = {
  'M-Pesa': '#16a34a',
  'Cash':   '#f59e0b',
};

const STATUS_STYLES: Record<string, string> = {
  PAID:    'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export default function FinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['store-finance'],
    queryFn: () => api.get('/store/finance').then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const d = data!;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Finance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp,     label: 'This Month',       value: d.summary.thisMonth,      color: 'bg-blue-500' },
          { icon: DollarSign,     label: 'Collected',        value: d.summary.totalCollected,  color: 'bg-green-500' },
          { icon: Clock,          label: 'Pending Payment',  value: d.summary.pendingPayment,  color: 'bg-yellow-500' },
          { icon: AlertTriangle,  label: 'Overdue',          value: d.summary.overdue,         color: 'bg-red-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-900">KES {value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={d.paymentMethods} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={70}
                label={({ method, count }) => `${method} (${count})`}>
                {d.paymentMethods.map((m: any) => (
                  <Cell key={m.method} fill={METHOD_COLORS[m.method] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-2">
            {d.paymentMethods.map((m: any) => (
              <div key={m.method} className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: METHOD_COLORS[m.method] ?? '#6b7280' }} />
                  <span className="text-xs font-medium text-gray-700">{m.method}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">KES {m.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{m.count} transactions</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Collection Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Billed',    amount: d.summary.thisMonth,     pct: 100 },
              { label: 'Collected',       amount: d.summary.totalCollected, pct: Math.round(d.summary.totalCollected / d.summary.thisMonth * 100) },
              { label: 'Pending',         amount: d.summary.pendingPayment, pct: Math.round(d.summary.pendingPayment / d.summary.thisMonth * 100) },
              { label: 'Overdue',         amount: d.summary.overdue,        pct: Math.round(d.summary.overdue / d.summary.thisMonth * 100) },
            ].map(({ label, amount, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-800">KES {amount.toLocaleString()} <span className="text-gray-400">({pct}%)</span></span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs text-gray-400 font-medium">Order</th>
                <th className="text-left py-2 text-xs text-gray-400 font-medium">Customer</th>
                <th className="text-left py-2 text-xs text-gray-400 font-medium">Method</th>
                <th className="text-right py-2 text-xs text-gray-400 font-medium">Amount</th>
                <th className="text-right py-2 text-xs text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.recentTransactions.map((t: any) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-xs font-mono text-gray-500">{t.orderNumber}</td>
                  <td className="py-3 font-medium text-gray-800">{t.customer}</td>
                  <td className="py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', t.method === 'M-Pesa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {t.method}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-900">KES {t.amount.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[t.status] ?? '')}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
