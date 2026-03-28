import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Tanlang...',
  searchable = false,
  className,
  disabled,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const filtered = searchable
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-left transition-all',
          'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700',
          'focus:outline-none',
          open
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'hover:border-slate-300 dark:hover:border-slate-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'flex-1 truncate text-sm font-semibold',
            selected
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-slate-400 transition-transform shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border-0 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="Qidirish..."
                />
              </div>
            </div>
          )}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400 text-center font-semibold">
                Topilmadi
              </p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                    opt.value === value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.hint && (
                    <span className="text-[10px] text-slate-400 font-normal shrink-0">
                      {opt.hint}
                    </span>
                  )}
                  {opt.value === value && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
