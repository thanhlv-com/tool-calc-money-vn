import React from 'react';

export interface CounterItemProps {
  key?: React.Key;
  label: string;
  value: number;
  quantity: number;
  onChange: (value: number, quantity: number) => void;
}

export const CounterItem: React.FC<CounterItemProps> = ({ label, value, quantity, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '');
    const parsed = Number.parseInt(digitsOnly, 10);
    onChange(value, Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const subtotal = value * quantity;

  return (
    <div className="flex items-center p-3 gap-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors py-3 px-4">
      <span className="w-16 sm:w-20 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">{label}</span>
      <input
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quantity || ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="0"
        className="flex-1 min-w-[80px] max-w-[140px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 dark:placeholder-slate-600"
      />
      <span className="flex-1 text-right font-mono text-slate-600 dark:text-slate-400 font-bold truncate">
        {new Intl.NumberFormat('vi-VN').format(subtotal)} đ
      </span>
    </div>
  );
}
