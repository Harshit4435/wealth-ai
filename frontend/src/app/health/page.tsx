'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HealthGauge from '@/components/HealthGauge';
import { 
  HeartPulse, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp, 
  Sliders 
} from 'lucide-react';
import { fetchHealthScore } from '@/lib/api';
import { FinancialHealthScore } from '@/lib/types';

export default function FinancialHealthPage() {
  const [health, setHealth] = useState<FinancialHealthScore | null>(null);

  useEffect(() => {
    fetchHealthScore().then(setHealth);
  }, []);

  const pillarDetails = [
    {
      name: 'Cash Flow Pillar',
      score: 81,
      target: '80+',
      status: 'Optimal',
      formula: 'Operating surplus after recurring obligations / Net monthly income',
      description: 'Your monthly income of ₹65,000 comfortably absorbs basic living expenses of ₹43,200. You maintain positive working capital buffer throughout each billing cycle.'
    },
    {
      name: 'Savings Rate Pillar',
      score: 63,
      target: '75+',
      status: 'Moderate',
      formula: 'Realized liquid savings / Gross monthly income',
      description: 'You are retaining 33.5% of income (₹21,800). While healthy, discretionary food surges prevent you from reaching the 40% optimal threshold for rapid wealth compounding.'
    },
    {
      name: 'Spending Discipline Pillar',
      score: 72,
      target: '70+',
      status: 'Elevated Velocity',
      formula: 'Discretionary category variance vs historical standard deviation',
      description: 'Discretionary burn rate is currently ₹1,440/day. High adherence in utilities and housing, but food delivery (Swiggy/Zomato) is running 46% above baseline.'
    },
    {
      name: 'Debt & Commitments Pillar',
      score: 84,
      target: '80+',
      status: 'Strong',
      formula: 'Total fixed obligations (Rent + Utilities) / Monthly income',
      description: 'Fixed obligations represent 30.9% of income (₹20,150), safely below the recommended 45% danger threshold.'
    },
    {
      name: 'Consistency Pillar',
      score: 51,
      target: '70+',
      status: 'High Volatility',
      formula: 'Coefficient of variation in daily debits across 30 days',
      description: 'Irregular burst spending (e.g. ₹18,500 electronics purchase and weekend delivery spikes) creates high variance in daily cash outflows.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-emerald-400" />
            <span>Financial Health Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic, explainable profiling calculated across 5 measurable pillars. No opaque black-box scoring.
          </p>
        </div>

        {/* Primary Health Gauge */}
        {health && <HealthGauge health={health} />}

        {/* Pillar Deep Dive */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">The 5 Explainable Pillars</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillarDetails.map((p) => (
              <div key={p.name} className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-extrabold text-white font-mono">{p.score}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                    <span className="text-[11px] text-slate-400 ml-auto">Target: {p.target}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 text-[10px] text-slate-400 font-mono mb-3">
                    {p.formula}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Health Levers */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/[0.08] flex flex-col gap-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Recommended Actions to Reach 85+ Score</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                1. Cap Dining Deliveries
              </span>
              <p className="text-slate-300 leading-relaxed">
                Limiting food delivery to ₹400/day for the remaining 12 days boosts your Consistency pillar from 51 to 68.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                2. Eliminate Zombie Subscription
              </span>
              <p className="text-slate-300 leading-relaxed">
                Canceling the inactive ₹799 monthly recurring debit frees up ₹9,588/yr directly into your high-yield reserve.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                3. Lock Payday Savings
              </span>
              <p className="text-slate-300 leading-relaxed">
                Automate an immediate ₹15,000 transfer to your index fund on Day 1 of salary credit to protect your savings target.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
