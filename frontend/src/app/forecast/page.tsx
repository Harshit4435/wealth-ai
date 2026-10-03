'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SpendingChart from '@/components/SpendingChart';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Calendar, ArrowUpRight } from 'lucide-react';
import { fetchSpendingForecast } from '@/lib/api';
import { SpendingForecast } from '@/lib/types';

export default function ForecastPage() {
  const [forecast, setForecast] = useState<SpendingForecast | null>(null);

  useEffect(() => {
    fetchSpendingForecast().then(setForecast);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-emerald-400" />
            <span>Spending Velocity & Forecasting Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predictive time-series run-rates and category deviation modeling against 90-day baselines.
          </p>
        </div>

        {/* Top KPIs */}
        {forecast && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Spent So Far</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                ₹{forecast.current_month_spent.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Day 18 of current month</span>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-amber-500/[0.04]">
              <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">Predicted Month-End</span>
              <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
                ₹{forecast.predicted_month_end.toLocaleString()}
              </div>
              <span className="text-xs text-amber-400/80 mt-1 block">Based on daily burn rate</span>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Historical Average</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                ₹{forecast.historical_monthly_avg.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">3-month baseline mean</span>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-500/[0.04]">
              <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider">Velocity Deviation</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
                +{forecast.velocity_percent}%
              </div>
              <span className="text-xs text-rose-300/80 mt-1 block">Above normal run-rate</span>
            </div>
          </div>
        )}

        {/* Visual Chart */}
        <div className="w-full">
          <SpendingChart />
        </div>

        {/* Category Breakdown Forecast Table */}
        {forecast && (
          <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Category Run-Rate Projections</h3>
              <p className="text-xs text-slate-400">Comparing current burn rates against individual category historical limits</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Category</th>
                    <th className="pb-3">Spent So Far</th>
                    <th className="pb-3">Projected Month-End</th>
                    <th className="pb-3">Baseline Limit</th>
                    <th className="pb-3">Deviation</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {forecast.category_forecasts.map((cat) => (
                    <tr key={cat.category} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white">
                        {cat.category}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        ₹{cat.spent_so_far.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-white">
                        ₹{cat.predicted_month_end.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-mono text-slate-400">
                        ₹{cat.historical_baseline.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-mono font-bold">
                        <span className={cat.deviation_percent > 20 ? 'text-rose-400' : cat.deviation_percent < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          {cat.deviation_percent > 0 ? '+' : ''}{cat.deviation_percent}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cat.status === 'critical'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : cat.status === 'optimal'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
