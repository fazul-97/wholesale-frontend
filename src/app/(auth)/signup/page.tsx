'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, User, Building2, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { OTPInput } from '@/components/ui/OTPInput';
import { useRegister, useVerifyOtp } from '@/hooks/useAuth';

type Step = 'details' | 'otp';

export default function SignUpPage() {
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [err, setErr] = useState('');

  const register = useRegister();
  const verifyOtp = useVerifyOtp();

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length <= 10) return '+254' + digits.slice(1);
    if (digits.startsWith('254')) return '+' + digits;
    if (digits.startsWith('7') || digits.startsWith('1')) return '+254' + digits;
    return val;
  };

  const handleSendOtp = () => {
    setErr('');
    if (!name.trim()) { setErr('Please enter your full name'); return; }
    const fp = formatPhone(phone);
    if (!fp.match(/^\+254[17]\d{8}$/)) { setErr('Enter a valid Kenyan phone number'); return; }
    setFormattedPhone(fp);
    register.mutate({ name: name.trim(), businessName: businessName.trim(), phone: fp }, {
      onSuccess: () => { setStep('otp'); setOtpValue(''); },
      onError: (e: unknown) =>
        setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP'),
    });
  };

  const handleOtpChange = (code: string) => {
    setOtpValue(code);
    if (code.length === 6) {
      setErr('');
      verifyOtp.mutate({ phone: formattedPhone, code, name: name.trim(), businessName: businessName.trim() }, {
        onError: (e: unknown) =>
          setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid OTP'),
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
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step === 'details' ? 'bg-amber-500' : 'bg-amber-500'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step === 'otp' ? 'bg-amber-500' : 'bg-gray-200'}`} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

          {step === 'details' ? (
            <>
              <h2 className="text-xl font-bold text-navy mb-1">Create account</h2>
              <p className="text-gray-500 text-sm mb-6">Fill in your details to get started</p>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Mary Wanjiru"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Business / Shop Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Mary's General Store"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
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
                  <p className="text-xs text-gray-400 mt-1.5">We&apos;ll send a 6-digit verification code via SMS</p>
                </div>

                {err && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

                <button
                  onClick={handleSendOtp}
                  disabled={register.isPending || !name.trim() || !phone.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-navy font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {register.isPending
                    ? <Loader2 size={18} className="animate-spin" />
                    : <><span>Send Verification Code</span><ArrowRight size={16} /></>
                  }
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('details'); setErr(''); setOtpValue(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
              >
                ← Back
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">Verify your number</h2>
                  <p className="text-gray-500 text-xs">Code sent to <span className="font-semibold text-navy">{formattedPhone}</span></p>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-5">
                Enter the 6-digit code we just sent to your phone to complete sign up.
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
                  <span>Creating your account...</span>
                </div>
              )}

              <button
                onClick={() => {
                  setErr('');
                  register.mutate({ name: name.trim(), businessName: businessName.trim(), phone: formattedPhone }, {
                    onError: (e: unknown) =>
                      setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend'),
                  });
                }}
                disabled={register.isPending}
                className="w-full text-sm text-amber-600 hover:text-amber-700 mt-4 py-2 transition-colors"
              >
                Resend code
              </button>

              {/* Demo hint */}
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <p className="text-xs text-amber-700 font-medium">Demo tip: use code <span className="font-mono font-bold">123456</span></p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-700">
            Sign in
          </Link>
        </p>

        <p className="text-center text-sm text-gray-400 mt-2">
          Store owner?{' '}
          <Link href="/store/login" className="text-amber-600 font-semibold hover:text-amber-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
