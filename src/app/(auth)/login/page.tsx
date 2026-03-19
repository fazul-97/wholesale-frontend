'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { OTPInput } from '@/components/ui/OTPInput';
import { useRequestOtp, useVerifyOtp } from '@/hooks/useAuth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpValue, setOtpValue] = useState('');
  const [err, setErr] = useState('');

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length <= 10) return '+254' + digits.slice(1);
    if (digits.startsWith('254')) return '+' + digits;
    if (digits.startsWith('7') || digits.startsWith('1')) return '+254' + digits;
    return val;
  };

  const handleSendOtp = async () => {
    setErr('');
    const formatted = formatPhone(phone);
    if (!formatted.match(/^\+254[17]\d{8}$/)) { setErr('Enter a valid Kenyan phone number'); return; }
    requestOtp.mutate(formatted, {
      onSuccess: () => { setPhone(formatted); setStep('otp'); setOtpValue(''); },
      onError: (e: unknown) => setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP'),
    });
  };

  const handleOtpChange = (code: string) => {
    setOtpValue(code);
    if (code.length === 6) {
      setErr('');
      verifyOtp.mutate({ phone, code }, {
        onError: (e: unknown) => setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid OTP'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy rounded-2xl mb-4 shadow-lg">
            <ShoppingBag size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-navy">Metro Wholesale</h1>
          <p className="text-gray-500 text-sm mt-1">Order with confidence</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {step === 'phone' ? (
            <>
              <h2 className="text-xl font-bold text-navy mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your phone number to continue</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      placeholder="0712 345 678"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">We&apos;ll send a 6-digit code via SMS</p>
                </div>

                {err && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

                <button
                  onClick={handleSendOtp}
                  disabled={requestOtp.isPending || !phone.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-navy font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {requestOtp.isPending ? <Loader2 size={18} className="animate-spin" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
                </button>

                {/* Demo hint */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Demo:</span> Use any phone number, then enter code <span className="font-mono font-bold">123456</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('phone'); setErr(''); setOtpValue(''); }} className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-navy mb-1">Enter your code</h2>
              <p className="text-gray-500 text-sm mb-6">
                Sent to <span className="font-semibold text-navy">{phone}</span>
              </p>

              <OTPInput
                length={6}
                value={otpValue}
                onChange={handleOtpChange}
                disabled={verifyOtp.isPending}
              />

              {err && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mt-4">{err}</p>}

              {verifyOtp.isPending && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </div>
              )}

              <button
                onClick={() => { setErr(''); requestOtp.mutate(phone, { onError: (e: unknown) => setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend') }); }}
                disabled={requestOtp.isPending}
                className="w-full text-sm text-amber-600 hover:text-amber-700 mt-4 py-2 transition-colors"
              >
                Resend code
              </button>
            </>
          )}
        </div>

        {/* Sign up link */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4 text-center">
          <p className="text-sm text-gray-500">New to Metro Wholesale?</p>
          <Link
            href="/signup"
            className="mt-2 flex items-center justify-center gap-2 w-full border-2 border-amber-500 text-amber-600 font-bold py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-sm"
          >
            Create a free account <ArrowRight size={14} />
          </Link>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Store owner?{' '}
          <Link href="/store/login" className="text-amber-600 font-semibold hover:text-amber-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
