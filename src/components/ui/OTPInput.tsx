'use client';
import { useRef, KeyboardEvent } from 'react';

interface OTPInputProps { length?: number; value: string; onChange: (v: string) => void; disabled?: boolean; }

export function OTPInput({ length = 6, value, onChange, disabled }: OTPInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const arr = value.split('');
    arr[index] = char.slice(-1);
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (char && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (text) { onChange(text); refs.current[Math.min(text.length, length - 1)]?.focus(); }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-mono font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white disabled:opacity-50 transition-colors"
        />
      ))}
    </div>
  );
}
