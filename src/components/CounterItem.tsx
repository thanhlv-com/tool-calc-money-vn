import React from 'react';
import { Plus, X } from 'lucide-react';

export interface CounterItemProps {
  label: string;
  value: number;
  batches: number[];
  onBatchChange: (value: number, batchIndex: number, quantity: number) => void;
  onAddBatch: (value: number) => void;
  onRemoveBatch: (value: number, batchIndex: number) => void;
}

export const CounterItem: React.FC<CounterItemProps> = ({
  label,
  value,
  batches,
  onBatchChange,
  onAddBatch,
  onRemoveBatch
}) => {
  const visibleBatches = batches.length > 0 ? batches : [0];

  const handleChange = (batchIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '');
    const parsed = Number.parseInt(digitsOnly, 10);
    onBatchChange(value, batchIndex, Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const totalQuantity = batches.reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  const subtotal = value * totalQuantity;

  return (
    <div className="p-3 gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors py-3 px-4">
      <div className="flex items-start gap-3 md:gap-6">
        <span className="w-16 sm:w-20 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap pt-2">{label}</span>
        <div className="flex-1 min-w-0 space-y-2">
          {visibleBatches.map((quantity, index) => (
            <div key={`${value}-${index}`} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity || ''}
                onChange={(e) => handleChange(index, e)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder="0"
                className="w-full min-w-[80px] max-w-[170px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 dark:placeholder-slate-600"
              />
              {visibleBatches.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveBatch(value, index)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Xóa cụm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddBatch(value)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Plus className="w-3 h-3" />
            Thêm cụm
          </button>
        </div>
        <span className="flex-1 text-right font-mono text-slate-600 dark:text-slate-400 font-bold truncate pt-2">
          {new Intl.NumberFormat('vi-VN').format(subtotal)} đ
        </span>
      </div>
    </div>
  );
};
