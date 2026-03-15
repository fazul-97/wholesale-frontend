'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useStoreLogin } from '@/hooks/useAuth';

export default function StoreLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const login = useStoreLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    login.mutate({ email, password }, {
      onError: (e: unknown) => setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials'),
    });
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg">
            <Store size={32} className="text-navy" />
          </div>
          <h1 className="text-2xl font-bold text-white">Store Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Metro Wholesale Management</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-navy mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Access your store dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@store.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {err && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-navy hover:bg-navy/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {login.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Customer?{' '}
          <Link href="/login" className="text-amber-400 font-semibold hover:text-amber-300">
            Order here
          </Link>
        </p>
      </div>
    </div>
  );
}
