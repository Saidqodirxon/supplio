import { useRef } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Uzbek phone mask: +998 (XX) XXX-XX-XX
 * Stores raw digits internally, exposes formatted display.
 */
function maskPhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '');

  // Always prefix with 998
  let d = digits;
  if (d.startsWith('998')) d = d.slice(3);
  else if (d.startsWith('8')) d = d.slice(1);

  // Limit to 9 digits after country code
  d = d.slice(0, 9);

  if (d.length === 0) return '+998 ';
  if (d.length <= 2) return `+998 (${d}`;
  if (d.length <= 5) return `+998 (${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `+998 (${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5)}`;
  return `+998 (${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

function rawPhone(formatted: string): string {
  const digits = formatted.replace(/\D/g, '');
  if (digits.startsWith('998')) return '+' + digits;
  return '+998' + digits.slice(0, 9);
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = '+998 (90) 123-45-67',
  className = '',
  disabled = false,
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const newRaw = rawPhone(raw);
    onChange(newRaw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    // Block non-digit input
    if (!/[\d]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const displayed = value ? maskPhone(value) : '';

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Phone className="w-4 h-4 text-slate-400" />
      </div>
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        value={displayed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`pl-10 ${className}`}
      />
    </div>
  );
}
