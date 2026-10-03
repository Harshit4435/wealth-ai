'use client';

import React from 'react';
import { FinancialHealthScore } from '@/lib/types';
import { ShieldCheck, Info } from 'lucide-react';

interface HealthGaugeProps {
  health: FinancialHealthScore;
}

export default function HealthGauge({ health }: HealthGaugeProps) {
  const pillars = [
    { name: 'Cash Flow', score: health.cash_flow_score, color: 'from-emerald-400 to-teal-500', desc: 'Operating runway after living costs' },
    { name: 'Savings Rate', score: health.savings_score, color: 'from-cyan-400 to-blue-500', desc: '% of salary retained' },
    { name: 'Spending Discipline', score: health.spending_score, color: 'from-amber-400 to-orange-500', desc: 'Discretionary limits adherence' },
    { name: 'Debt & Commitments', score: health.debt_score, color: 'from-indigo-400 to-purple-500', desc: 'Fixed monthly obligations ratio' },
    { name: 'Consistency', score: health.consistency_score, color: 'from-rose-400 to-pink-500', desc: 'Spending velocity stability' },
  ];

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (health.overall_score / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Financial Health Profile</h3>
            <p className="text-xs text-slate-400">Multi-pillar transparent intelligence engine</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {health.health_grade}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Radial Composite Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/40 border border-white/5">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">{health.overall_score}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Score / 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3 max-w-[200px]">
            Weighted synthesis of your 5 explainable financial factors.
          </p>
        </div>

        {/* 5 Transparent Pillars */}
        <div className="md:col-span-8 flex flex-col gap-3">
          {pillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{pillar.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] hidden sm:inline">{pillar.desc}</span>
                  <span className="font-mono font-bold text-white text-xs">{pillar.score} <span className="text-slate-500 font-normal">/ 100</span></span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${pillar.color} transition-all duration-700 ease-out`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Operational Indicators Footer */}
      <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {health.indicators.map((ind) => (
          <div key={ind.label} className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">{ind.label}</span>
            <span className="text-sm font-bold text-white tracking-tight mt-0.5">{ind.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span>Transparent scoring: Scores are computed directly from measurable transaction velocity, savings margins, and fixed obligations.</span>
      </div>
    </div>
  );
}
