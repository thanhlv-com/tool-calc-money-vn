import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Download, History, Calculator, Save, Trash2, X, Sun, Moon, Monitor } from 'lucide-react';
import { MAIN_DENOMINATIONS, EXTRA_DENOMINATIONS, RecordCounts, HistoryItem, ThemeMode } from './types';
import { CounterItem } from './components/CounterItem';

const sumBatches = (batches: number[] = []) =>
  batches.reduce((acc, qty) => acc + (Number(qty) || 0), 0);

const normalizeBatches = (value: unknown): number[] => {
  const source = Array.isArray(value) ? value : [value];
  return source
    .map(item => Number(item))
    .filter(item => Number.isFinite(item) && item > 0)
    .map(item => Math.floor(item));
};

const normalizeCounts = (value: unknown): RecordCounts => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const normalized: RecordCounts = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, rawBatches]) => {
    const denomination = Number(key);
    if (!Number.isFinite(denomination)) return;

    const batches = normalizeBatches(rawBatches);
    if (batches.length > 0) {
      normalized[denomination] = batches;
    }
  });

  return normalized;
};

const cloneCounts = (value: RecordCounts): RecordCounts =>
  Object.fromEntries(
    Object.entries(value).map(([denomination, batches]) => [Number(denomination), [...batches]])
  ) as RecordCounts;

const formatBatchBreakdown = (batches: number[] = []) =>
  batches.filter(qty => qty > 0).join(' + ');

export default function App() {
  const [counts, setCounts] = useState<RecordCounts>({});
  const [showExtra, setShowExtra] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [themeProvider, setThemeProvider] = useState<ThemeMode>('system');
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('money-counter-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalizedHistory = parsed.map((item): HistoryItem => ({
            ...item,
            counts: normalizeCounts(item?.counts)
          }));
          setHistory(normalizedHistory);
        }
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    const savedTheme = localStorage.getItem('money-counter-theme') as ThemeMode;
    if (savedTheme) {
      setThemeProvider(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (themeProvider === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeProvider);
    }
    localStorage.setItem('money-counter-theme', themeProvider);
  }, [themeProvider]);

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const nextTheme = modes[(modes.indexOf(themeProvider) + 1) % modes.length];
    setThemeProvider(nextTheme);
  };

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('money-counter-history', JSON.stringify(newHistory));
  };

  const handleBatchChange = (value: number, batchIndex: number, quantity: number) => {
    setCounts(prev => {
      const nextBatches = [...(prev[value] ?? [0])];
      nextBatches[batchIndex] = quantity;
      return { ...prev, [value]: nextBatches };
    });
  };

  const handleAddBatch = (value: number) => {
    setCounts(prev => {
      const nextBatches = [...(prev[value] ?? [])];
      nextBatches.push(0);
      return { ...prev, [value]: nextBatches };
    });
  };

  const handleRemoveBatch = (value: number, batchIndex: number) => {
    setCounts(prev => {
      const nextBatches = [...(prev[value] ?? [])];
      if (nextBatches.length <= 1) {
        return { ...prev, [value]: [0] };
      }

      nextBatches.splice(batchIndex, 1);
      return { ...prev, [value]: nextBatches };
    });
  };

  const clearCounts = () => {
    setCounts({});
  };

  const currentTotal = (Object.entries(counts) as Array<[string, number[]]>).reduce(
    (acc, [val, batches]) => acc + Number(val) * sumBatches(batches),
    0
  );

  const totalNotes = (Object.values(counts) as number[][]).reduce(
    (acc, batches) => acc + sumBatches(batches),
    0
  );
  const hasAnyQuantity = totalNotes > 0;

  const handleSaveSession = () => {
    if (currentTotal === 0) return;
    const cleanedCounts = normalizeCounts(counts);
    
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      counts: cloneCounts(cleanedCounts),
      totalSum: currentTotal
    };

    saveHistory([newItem, ...history].slice(0, 50)); // keep last 50
    clearCounts();
  };

  const removeHistoryItem = (id: string) => {
    saveHistory(history.filter(item => item.id !== id));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCounts(normalizeCounts(item.counts));
    setShowHistory(false);
  };

  const exportPDF = async () => {
    if (!reportRef.current || currentTotal === 0) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Kiem_Ke_Tien_${format(new Date(), 'dd-MM-yyyy_HHmm')}.pdf`);
    } catch (err) {
      console.error('PDF Export error', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans selection:bg-cyan-100 dark:selection:bg-cyan-900 selection:text-cyan-900 dark:selection:text-cyan-100">
      
      {/* Header Section */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase">Công Cụ Kiểm Tiền</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Cập nhật lúc: {format(new Date(), 'HH:mm - dd/MM/yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={cycleTheme}
            className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 w-9 md:w-10 h-9 md:h-10 rounded-md transition-colors border border-slate-300 dark:border-slate-600"
            title={`Chế độ: ${themeProvider}`}
          >
            {themeProvider === 'light' ? <Sun className="w-4 h-4" /> : themeProvider === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 md:px-4 py-2 rounded-md font-semibold text-xs md:text-sm transition-colors border border-slate-300 dark:border-slate-600"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">Lịch Sử</span>
          </button>
          <button
            onClick={exportPDF}
            disabled={currentTotal === 0 || isExporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-2 rounded-md font-semibold text-xs md:text-sm transition-shadow shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <span className="animate-pulse">...</span> : <Download className="w-4 h-4 md:w-5 md:h-5" />}
            <span className="hidden md:inline">Xuất PDF</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col md:flex-row flex-1 overflow-hidden p-4 md:p-6 gap-4 md:gap-6">
        
        {/* Left Column: Input Form */}
        <section className="flex-[2] flex flex-col gap-4 md:gap-6 overflow-y-auto min-h-0 relative">
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Mệnh Giá Phổ Biến</h3>
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded">PHỔ BIẾN</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {MAIN_DENOMINATIONS.map(denom => (
                <CounterItem
                  key={denom.value}
                  label={denom.label}
                  value={denom.value}
                  batches={counts[denom.value] || []}
                  onBatchChange={handleBatchChange}
                  onAddBatch={handleAddBatch}
                  onRemoveBatch={handleRemoveBatch}
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Mệnh Giá Nhỏ</h3>
              <button onClick={() => setShowExtra(!showExtra)} className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold hover:underline">
                {showExtra ? 'THU GỌN' : '+ HIỂN THỊ TẤT CẢ'}
              </button>
            </div>
            {showExtra && (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                {EXTRA_DENOMINATIONS.map(denom => (
                  <CounterItem
                    key={denom.value}
                    label={denom.label}
                    value={denom.value}
                    batches={counts[denom.value] || []}
                    onBatchChange={handleBatchChange}
                    onAddBatch={handleAddBatch}
                    onRemoveBatch={handleRemoveBatch}
                  />
                ))}
              </div>
            )}
          </div>
            
          <div className="flex gap-3 shrink-0 pb-6 mt-auto px-[1px]">
             <button
              onClick={clearCounts}
              className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-md font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider text-xs md:text-sm"
            >
              Làm lại
            </button>
            <button
              onClick={handleSaveSession}
              disabled={currentTotal === 0}
              className="flex-[2] py-3 px-4 bg-slate-800 text-white rounded-md font-bold hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs md:text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu vào lịch sử
            </button>
          </div>
        </section>

        {/* Right Column: Summary Report */}
        <aside className="flex-[1.5] w-full flex flex-col gap-4 md:gap-6 overflow-y-auto min-h-0">
          
          <div className="bg-emerald-600 dark:bg-emerald-800 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <p className="text-emerald-100 dark:text-emerald-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">Tổng Tiền Kiểm Kê</p>
              <div className="text-4xl font-black mb-4">
                {formatMoney(currentTotal)} <span className="text-lg">đ</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-emerald-500 dark:border-emerald-700">
                <div className="text-center text-left">
                  <p className="text-[10px] uppercase text-emerald-100 dark:text-emerald-200 font-semibold tracking-wider">Tổng Tờ</p>
                  <p className="text-lg font-bold">
                    {totalNotes}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Calculator className="w-32 h-32" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col flex-1 shrink-0 overflow-hidden relative">
             <div ref={reportRef} className="p-5 md:p-6 bg-white dark:bg-slate-800 w-full h-full">
                <div className="text-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Phiếu Kiểm Tiền</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    {format(new Date(), 'HH:mm - dd/MM/yyyy')}
                  </p>
                </div>

                <div className="space-y-1 mb-4 h-full">
                  {!hasAnyQuantity && (
                    <div className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm italic">
                      Chưa có số liệu...
                    </div>
                  )}
                  
                  {[...MAIN_DENOMINATIONS, ...EXTRA_DENOMINATIONS]
                    .filter(d => sumBatches(counts[d.value]) > 0)
                    .map(d => {
                      const denominationBatches = counts[d.value] || [];
                      const denominationTotalQuantity = sumBatches(denominationBatches);
                      const batchLabel = formatBatchBreakdown(denominationBatches);

                      return (
                        <div key={d.value} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded -mx-2 transition-colors">
                          <span className="text-slate-600 dark:text-slate-300 font-bold w-16">{d.label}</span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">
                            x{batchLabel || denominationTotalQuantity}
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100 flex-1 text-right">
                            {formatMoney(d.value * denominationTotalQuantity)} đ
                          </span>
                        </div>
                      );
                    })}
                </div>
             </div>
          </div>
        </aside>
      </main>

      {/* History Modal Overlay */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Lịch sử kiểm đếm</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-white dark:bg-slate-800">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm italic">
                  Chưa có lịch sử lưu nền.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors group">
                      <button className="flex-1 text-left flex flex-col cursor-pointer" onClick={() => loadHistoryItem(item)}>
                        <div className="flex items-baseline gap-2 mb-1">
                           <span className="text-xs font-bold text-slate-800 dark:text-slate-300 tracking-wide uppercase">
                             Lịch sử lưu
                           </span>
                           <span className="text-xs text-slate-500 dark:text-slate-400 font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                             {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}
                           </span>
                        </div>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                          {formatMoney(item.totalSum)} <span className="text-sm font-medium">đ</span>
                        </span>
                      </button>
                      
                      <button
                        onClick={() => removeHistoryItem(item.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors ml-4"
                        title="Xóa"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
