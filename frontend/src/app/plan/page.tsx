'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FinancialPlanModal from '@/components/FinancialPlanModal';
import { 
  Target, 
  Wallet, 
  Home, 
  PiggyBank, 
  Coins, 
  Sliders, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { fetchSavingsPlan } from '@/lib/api';
import { SavingsPlan } from '@/lib/types';

export default function PlanPage() {
  const [plan, setPlan] = useState<SavingsPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSavingsPlan().then(setPlan);
  }, []);

  const handlePlanUpdated = (updatedPlan: SavingsPlan) => {
    setPlan(updatedPlan);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Target className="h-7 w-7 text-emerald-400" />
              <span>Personal Financial Plan & Savings Chart</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personalized budget allocation based on your income, rent obligations, and target savings goal.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            <span>Customize Income, Rent & Goal</span>
          </button>
        </div>

        {plan && (
          <>
            {/* Top 4 Key Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Monthly Take-Home</span>
                  <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white font-mono mt-2">
                  ₹{plan.monthly_income.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 mt-1">100% Monthly Cash Flow</span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-cyan-950/[0.04] flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Housing & Rent</span>
                  <Home className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-extrabold text-white font-mono mt-2">
                  {plan.rent_amount > 0 ? `₹${plan.rent_amount.toLocaleString()}` : '₹0 (No Rent)'}
                </div>
                <span className="text-[11px] text-cyan-400/80 mt-1">
                  {plan.rent_amount > 0 ? `${Math.round((plan.rent_amount / plan.monthly_income) * 100)}% of monthly income` : '100% equity / no rent'}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/[0.04] flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Target Savings</span>
                  <PiggyBank className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">
                  ₹{plan.target_savings.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <span className="text-[11px] text-emerald-400/80 mt-1">
                  {plan.savings_percentage}% savings allocation
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-amber-500/[0.04] flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Daily Discretionary</span>
                  <Coins className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-amber-300 font-mono mt-2">
                  ₹{Math.round(plan.daily_discretionary_budget).toLocaleString()} <span className="text-xs font-normal text-slate-400">/day</span>
                </div>
                <span className="text-[11px] text-amber-400/80 mt-1">
                  ₹{Math.round(plan.weekly_discretionary_budget).toLocaleString()} weekly non-essential budget
                </span>
              </div>

            </div>

            {/* Budget Blueprint Breakdown */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Personalized Budget Blueprint</h3>
                  <p className="text-xs text-slate-400">Calculated distribution to guarantee your target savings rate</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                  {plan.plan_status} Financial Architecture
                </span>
              </div>

              {/* Progress Bar Stack */}
              <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden flex shadow-inner">
                <div style={{ width: `${plan.fixed_needs_percentage}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
                <div style={{ width: `${plan.savings_percentage}%` }} className="bg-cyan-400 h-full transition-all duration-500" />
                <div style={{ width: `${plan.wants_percentage}%` }} className="bg-amber-400 h-full transition-all duration-500" />
              </div>

              {/* 3 Categories Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plan.budget_breakdown.map((b) => (
                  <div key={b.category} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{b.category}</span>
                      <span className="font-mono font-bold text-emerald-400">{b.percentage}%</span>
                    </div>
                    <div className="text-xl font-extrabold text-white font-mono">
                      ₹{b.amount.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {b.items}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 24-Month Savings Growth Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Projected Savings Growth Trajectory
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual milestone chart: how your capital accumulates month by month at ₹{plan.target_savings.toLocaleString()}/month
                </p>
              </div>

              {/* Visual Bar Chart for Milestones */}
              <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-3 px-2 border-b border-white/5 relative">
                {plan.projected_timeline.map((item) => {
                  const maxProjection = plan.projected_timeline[plan.projected_timeline.length - 1].total_saved || 360000;
                  const heightPct = Math.min(100, Math.max(15, (item.total_saved / maxProjection) * 100));

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      
                      {/* Milestone badge tooltip if hit */}
                      {item.milestone_hit && (
                        <div className="hidden sm:block absolute -top-2 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                          {item.milestone_hit}
                        </div>
                      )}

                      <span className="text-[10px] font-mono font-bold text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity">
                        ₹{(item.total_saved / 1000).toFixed(0)}k
                      </span>

                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 hover:from-emerald-500 hover:to-cyan-300 transition-all duration-500 ease-out cursor-pointer shadow-lg shadow-emerald-500/10"
                        style={{ height: `${heightPct}%` }}
                      />

                      <span className="text-[11px] font-medium text-slate-400">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Timeline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {plan.projected_timeline.slice(0, 4).map((m) => (
                  <div key={m.month} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{m.label} Milestone</span>
                      <span className="font-mono text-emerald-400 font-bold">{m.goal_percentage}%</span>
                    </div>
                    <span className="text-base font-extrabold text-white font-mono">
                      ₹{m.total_saved.toLocaleString()}
                    </span>
                    {m.milestone_hit && (
                      <span className="text-[10px] text-cyan-300 font-semibold mt-1">
                        {m.milestone_hit}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Insights & Guardrails */}
            <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/[0.06] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Actionable Plan Insights</h3>
              </div>

              <div className="flex flex-col gap-2">
                {plan.insights.map((ins, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>

      <FinancialPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlanUpdated={handlePlanUpdated}
      />
    </div>
  );
}
