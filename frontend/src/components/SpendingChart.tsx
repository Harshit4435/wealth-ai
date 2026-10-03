'use client';

import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function SpendingChart() {
  const data = [
    { month: 'June', amount: 5200, isCurrent: false, isProjected: false },
    { month: 'July', amount: 5600, isCurrent: false, isProjected: false },
    { month: 'August', amount: 5400, isCurrent: false, isProjected: false },
    { month: 'September', amount: 5800, isCurrent: false, isProjected: false },
    { month: 'October (Now)', amount: 8100, isCurrent: true, isProjected: false },
    { month: 'Projected', amount: 9300, isCurrent: false, isProjected: true },
  ];

  const maxVal = 10000;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Spending Velocity & Trend</h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <TrendingUp className="h-3 w-3" />
              +46% Surge
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Historical monthly pattern vs current October run-rate</p>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/5 relative">
        
        {/* Baseline Guideline at 5,500 */}
        <div
          className="absolute left-0 right-0 border-b border-dashed border-slate-600/60 flex items-center justify-end pr-2 text-[10px] text-slate-400 font-mono"
          style={{ bottom: `${(5500 / maxVal) * 100}%` }}
        >
          <span className="bg-slate-900/90 px-1 rounded">3-Mo Baseline ₹5,500</span>
        </div>

        {data.map((item) => {
          const heightPct = (item.amount / maxVal) * 100;
          let barBg = 'bg-slate-800 hover:bg-slate-700';
          if (item.isCurrent) barBg = 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-lg shadow-amber-500/20';
          if (item.isProjected) barBg = 'bg-gradient-to-t from-rose-500/80 to-rose-400 border border-dashed border-rose-400 shadow-lg shadow-rose-500/20';

          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-mono font-bold text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity">
                ₹{item.amount.toLocaleString()}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer ${barBg}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className={`text-[11px] font-medium truncate max-w-full ${item.isCurrent ? 'text-amber-400 font-bold' : item.isProjected ? 'text-rose-400' : 'text-slate-400'}`}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ML Velocity Insight:</span> Food spending is currently ~40% above historical monthly baselines. Run-rate model estimates October food spending will close at ₹9,300 unless discretionary orders are capped.
        </div>
      </div>
    </div>
  );
}
