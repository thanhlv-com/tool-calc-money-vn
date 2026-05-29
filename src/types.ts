export interface Denomination {
  value: number;
  label: string;
}

export const MAIN_DENOMINATIONS: Denomination[] = [
  { value: 500000, label: '500,000₫' },
  { value: 200000, label: '200,000₫' },
  { value: 100000, label: '100,000₫' },
  { value: 50000, label: '50,000₫' },
];

export const EXTRA_DENOMINATIONS: Denomination[] = [
  { value: 20000, label: '20,000₫' },
  { value: 10000, label: '10,000₫' },
  { value: 5000, label: '5,000₫' },
  { value: 2000, label: '2,000₫' },
  { value: 1000, label: '1,000₫' },
];

export type RecordCounts = Record<number, number>;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface HistoryItem {
  id: string;
  timestamp: string;
  counts: RecordCounts;
  totalSum: number;
}
