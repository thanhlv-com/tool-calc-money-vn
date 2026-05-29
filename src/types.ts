export interface Denomination {
  value: number;
  label: string;
}

export const MAIN_DENOMINATIONS: Denomination[] = [
  { value: 500000, label: '500k' },
  { value: 200000, label: '200k' },
  { value: 100000, label: '100k' },
  { value: 50000, label: '50k' },
];

export const EXTRA_DENOMINATIONS: Denomination[] = [
  { value: 20000, label: '20k' },
  { value: 10000, label: '10k' },
  { value: 5000, label: '5k' },
  { value: 2000, label: '2k' },
  { value: 1000, label: '1k' },
];

export type RecordCounts = Record<number, number[]>;
export type LegacyRecordCounts = Record<number, number | number[]>;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface HistoryItem {
  id: string;
  timestamp: string;
  counts: LegacyRecordCounts;
  totalSum: number;
}
