'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  FolderPlus, 
  Wallet, 
  Home, 
  PiggyBank, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  ArrowRight, 
  Calendar, 
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldAlert,
  Flame,
  Clock
} from 'lucide-react';
import { fetchProject, createProject, logDailyExpense, resetProject } from '@/lib/api';
import { ProjectPlan, DailyDayRecord } from '@/lib/types';

export default function ProjectPage() {
  const [project, setProject] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State for Starting From Scratch
  const [projectName, setProjectName] = useState<string>("My Financial Blueprint");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(65000);
  const [paysRent, setPaysRent] = useState<boolean>(true);
  const [rentAmount, setRentAmount] = useState<number>(18000);
  const [otherFixedBills, setOtherFixedBills] = useState<number>(4200);
  const [targetMonthlySavings, setTargetMonthlySavings] = useState<number>(15000);
  const [targetTotalMilestone, setTargetTotalMilestone] = useState<number>(100000);
  const [totalMonths, setTotalMonths] = useState<number>(12);

  // Daily Logger State
  const [selectedDay, setSelectedDay] = useState<number>(4);
  const [dailySpendAmount, setDailySpendAmount] = useState<number>(850);
  const [dailySpendNote, setDailySpendNote] = useState<string>("Dining & transport");
  const [isSubmittingSpend, setIsSubmittingSpend] = useState<boolean>(false);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await fetchProject();
      setProject(data);
      if (data) {
        setProjectName(data.project_name);
        setMonthlyIncome(data.monthly_income);
        setRentAmount(data.rent_amount);
        setPaysRent(data.rent_amount > 0);
        setOtherFixedBills(data.other_fixed_bills);
        setTargetMonthlySavings(data.target_monthly_savings);
        setTargetTotalMilestone(data.target_total_milestone);
        setTotalMonths(data.total_months);
        
        // Pick first unlogged day
        const nextDay = data.days_data.find(d => d.actual_spent === 0);
        if (nextDay) setSelectedDay(nextDay.day);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newPlan = await createProject({
        project_name: projectName,
        monthly_income: Number(monthlyIncome),
        pays_rent: paysRent,
        rent_amount: paysRent ? Number(rentAmount) : 0,
        other_fixed_bills: Number(otherFixedBills),
        target_monthly_savings: Number(targetMonthlySavings),
        target_total_milestone: Number(targetTotalMilestone),
        total_months: Number(totalMonths)
      });
      setProject(newPlan);
      setIsFormOpen(false);
      triggerSuccessBadge(`Project '${newPlan.project_name}' created from scratch! Daily allowance initialized.`);
      const nextDay = newPlan.days_data.find(d => d.actual_spent === 0);
      if (nextDay) setSelectedDay(nextDay.day);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSpend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!project) return;
    setIsSubmittingSpend(true);
    try {
      const updated = await logDailyExpense(selectedDay, Number(dailySpendAmount), dailySpendNote);
      setProject(updated);
      
      const targetDay = updated.days_data.find(d => d.day === selectedDay);
      const isOver = targetDay && targetDay.status === 'overspent';
      
      triggerSuccessBadge(
        isOver
          ? `⚡ Day ${selectedDay} overspent! Existing project (${updated.id}) updated in-place. Remaining days & further months re-balanced.`
          : `✅ Day ${selectedDay} spend recorded. Existing project (${updated.id}) updated in-place.`
      );

      // Auto-advance to next upcoming day
      const nextDay = updated.days_data.find(d => d.actual_spent === 0 && d.day > selectedDay);
      if (nextDay) {
        setSelectedDay(nextDay.day);
      }
    } finally {
      setIsSubmittingSpend(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      const reset = await resetProject();
      setProject(reset);
      setSelectedDay(4);
      triggerSuccessBadge("Project reset to initial demonstration state.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccessBadge = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => {
      setActionSuccess(null);
    }, 6000);
  };

  // Quick preset calculations for live preview in form
  const previewFixedNeeds = (paysRent ? rentAmount : 0) + otherFixedBills + 6000;
  const previewWantsPool = Math.max(0, monthlyIncome - previewFixedNeeds - targetMonthlySavings);
  const previewDailyAllowance = Math.round((previewWantsPool / 30) * 100) / 100;

  // Maximum chart bar reference height
  const maxDaySpend = project 
    ? Math.max(project.base_daily_allowance * 1.5, ...project.days_data.map(d => d.actual_spent)) 
    : 1500;

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex flex-col gap-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                In-Place Re-balancing Engine
              </span>
              <span className="text-[11px] text-slate-400">
                Update it, not make new
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <FolderPlus className="h-7 w-7 text-emerald-400" />
              <span>Project Planner & Daily Expense Allowance</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Start a project from scratch with your income, rent, bills & savings targets. If you spend more on any day, 
              the system dynamically <strong className="text-emerald-300">updates this existing project in-place</strong>, recalibrating remaining days and future months.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <FolderPlus className="h-4 w-4" />
              <span>{isFormOpen ? 'Close Setup' : 'Add / Start New Project'}</span>
              {isFormOpen ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
            </button>

            <button
              onClick={handleResetDemo}
              title="Reset sample day spending to initial demo"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Dynamic Action Notification Banner */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-emerald-950/50 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-white">{actionSuccess}</span>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                Note: No duplicate project was created. The active project ID remains <code className="bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[10px]">{project?.id}</code> with updated budget parameters.
              </p>
            </div>
          </div>
        )}

        {/* 1. START FROM SCRATCH FORM (Collapsible Wizard) */}
        {isFormOpen && (
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-slate-950/70 shadow-2xl relative overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-400" />
                  <span>Start from Scratch: Enter All Project Inputs</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Insert all your financial variables below to generate your customized daily expense allowance chart.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 font-medium">
                Step 1 of 1: All-in-One Configuration
              </span>
            </div>

            <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Project Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Project or Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Europe Vacation, House Downpayment"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Monthly Net Income */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Monthly Take-Home Income (₹)</span>
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                </label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="500"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Rent Toggle & Amount */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Do you pay rent?</label>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPaysRent(true)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${paysRent ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaysRent(false); setRentAmount(0); }}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${!paysRent ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      No
                    </button>
                  </div>
                </div>
                {paysRent ? (
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    placeholder="Monthly rent amount (₹)"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400/90 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>No rent obligation (₹0)</span>
                  </div>
                )}
              </div>

              {/* Other Fixed Bills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Other Fixed Bills, EMIs & Utilities (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={otherFixedBills}
                  onChange={(e) => setOtherFixedBills(Number(e.target.value))}
                  placeholder="Electricity, wifi, EMIs"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Target Monthly Savings */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Target Monthly Savings (₹)</span>
                  <PiggyBank className="h-3.5 w-3.5 text-cyan-400" />
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={targetMonthlySavings}
                  onChange={(e) => setTargetMonthlySavings(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Target Total Milestone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Total Milestone Goal (₹)</span>
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                </label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="5000"
                  value={targetTotalMilestone}
                  onChange={(e) => setTargetTotalMilestone(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Live Preview Blueprint Banner */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    ₹
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Calculated Daily Allowance</span>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-emerald-400">₹{previewDailyAllowance.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-normal">/ day for non-essential expenses</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div>Essential Needs: <strong className="text-slate-200">₹{previewFixedNeeds.toLocaleString()}</strong></div>
                  <span>•</span>
                  <div>Wants Pool: <strong className="text-amber-300">₹{previewWantsPool.toLocaleString()}</strong></div>
                  <span>•</span>
                  <div>Target Savings: <strong className="text-cyan-300">₹{targetMonthlySavings.toLocaleString()}</strong></div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400 transition-all cursor-pointer whitespace-nowrap"
                >
                  🚀 Generate & Save Project
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 2. RE-BALANCING STATUS CALLOUT */}
        {project && (
          <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-slate-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`h-10 w-10 rounded-xl p-2 flex items-center justify-center shrink-0 ${
                project.total_overspent_this_month > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {project.total_overspent_this_month > 0 ? (
                  <Flame className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Dynamic Engine Status
                  </span>
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400 border border-white/10">
                    ID: {project.id}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {project.rebalancing_message || "Project initialized and on schedule."}
                </p>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  <span>Current Cap for Remaining Days: <strong className="text-emerald-400">₹{project.current_daily_allowance.toLocaleString()}/day</strong></span>
                  <span>•</span>
                  <span>Base Initial Cap: <strong className="text-slate-300">₹{project.base_daily_allowance.toLocaleString()}/day</strong></span>
                  <span>•</span>
                  <span>Next Month Target: <strong className="text-cyan-400">₹{project.next_month_adjusted_target.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <div className="self-end md:self-auto shrink-0 flex items-center gap-2">
              <span className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                In-Place Sync Active
              </span>
            </div>
          </div>
        )}

        {/* 3. KEY METRICS CARDS */}
        {project && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Daily Expense Allowance */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Daily Expense Allowance</span>
                <Coins className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
                  <span className="text-emerald-400">₹{project.current_daily_allowance.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-normal">/ day</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Base was ₹{project.base_daily_allowance.toLocaleString()}</span>
                  <span className="text-slate-500">•</span>
                  <span className={project.current_daily_allowance < project.base_daily_allowance ? 'text-amber-400' : 'text-emerald-400'}>
                    {project.current_daily_allowance < project.base_daily_allowance ? 'Re-balanced lower' : 'Full capacity'}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Discretionary Wants Pool */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Discretionary Wants Pool</span>
                <Wallet className="h-4 w-4 text-teal-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
                  <span>₹{Math.max(0, project.wants_monthly_pool - project.total_spent_this_month).toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-normal">left of ₹{project.wants_monthly_pool.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (project.total_spent_this_month / (project.wants_monthly_pool || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Total Overspent Amount */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Overspent Amount</span>
                <AlertTriangle className={`h-4 w-4 ${project.total_overspent_this_month > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white">
                  <span className={project.total_overspent_this_month > 0 ? 'text-amber-400' : 'text-slate-300'}>
                    ₹{project.total_overspent_this_month.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {project.total_overspent_this_month > 0 ? (
                    <span className="text-amber-400 font-medium">Re-balanced into remaining days</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">100% On budget</span>
                  )}
                </div>
              </div>
            </div>

            {/* Target Monthly Savings */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Monthly Savings Target</span>
                <PiggyBank className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-cyan-400">
                  ₹{project.target_monthly_savings.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Milestone: ₹{project.target_total_milestone.toLocaleString()} in {project.total_months} mo
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 4. THE DAILY EXPENSE ALLOWANCE CHART (How much it can expense) */}
        {project && (
          <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span>Daily Expense Allowance Chart (Day 1 to Day 30)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shows how much you can spend each day. Overspent days are highlighted in orange/red; remaining days automatically recalculate to keep your monthly savings intact.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                  <span className="text-slate-300">Spent Within Cap</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-amber-500" />
                  <span className="text-slate-300">Overspent Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-slate-700 border border-cyan-500/40" />
                  <span className="text-slate-300">Upcoming Cap</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2 pt-4 border-t border-white/5">
              {project.days_data.map((dayRecord) => {
                const isSelected = selectedDay === dayRecord.day;
                const isSpent = dayRecord.actual_spent > 0;
                const isOver = dayRecord.status === 'overspent';
                const heightPercent = Math.min(
                  100, 
                  Math.max(15, ((isSpent ? dayRecord.actual_spent : dayRecord.expense_cap) / maxDaySpend) * 100)
                );

                return (
                  <button
                    key={dayRecord.day}
                    onClick={() => {
                      setSelectedDay(dayRecord.day);
                      if (dayRecord.actual_spent > 0) {
                        setDailySpendAmount(dayRecord.actual_spent);
                      }
                    }}
                    className={`flex flex-col items-center justify-between p-2 rounded-xl transition-all cursor-pointer group text-left relative ${
                      isSelected
                        ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : isOver
                          ? 'bg-amber-950/30 border border-amber-500/40 hover:bg-amber-900/30'
                          : isSpent
                            ? 'bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/30'
                            : 'bg-slate-900/60 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Day number */}
                    <div className="w-full flex items-center justify-between text-[11px] font-semibold">
                      <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                        D{dayRecord.day}
                      </span>
                      {isOver && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-1 rounded">
                          !
                        </span>
                      )}
                    </div>

                    {/* Bar visualization */}
                    <div className="w-full h-24 flex items-end justify-center my-2">
                      <div 
                        className={`w-full max-w-[20px] rounded-t transition-all duration-300 ${
                          isOver
                            ? 'bg-gradient-to-t from-amber-600 to-rose-500 shadow-sm shadow-amber-500/30'
                            : isSpent
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-800/80 border-t-2 border-cyan-400/80'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Spend / Cap amount */}
                    <div className="w-full text-center">
                      <span className={`text-[10px] font-bold block truncate ${
                        isOver 
                          ? 'text-amber-400' 
                          : isSpent 
                            ? 'text-emerald-400' 
                            : 'text-slate-400'
                      }`}>
                        ₹{isSpent ? Math.round(dayRecord.actual_spent).toLocaleString() : Math.round(dayRecord.expense_cap).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {isSpent ? 'spent' : 'cap'}
                      </span>
                    </div>

                    {/* Overspent delta badge */}
                    {isOver && (
                      <div className="text-[9px] text-rose-300 font-semibold mt-0.5 truncate max-w-full">
                        +₹{Math.round(dayRecord.overspent_amount).toLocaleString()}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/5">
              <span>💡 Tip: Click any day card to log an expense or simulate what happens when you spend more.</span>
              <span className="text-slate-300 font-medium">Selected: <strong className="text-emerald-400">Day {selectedDay}</strong></span>
            </div>
          </div>
        )}

        {/* 5. INTERACTIVE EXPENSE LOGGER & OVERSPEND RE-BALANCER ("Update it, not make new") */}
        {project && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Spend Logger Form */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-slate-950/60 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <span>Log or Simulate Day {selectedDay}&apos;s Expense</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter what was spent. If it exceeds Day {selectedDay}&apos;s allowance, the engine will update the existing project in-place!
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Day {selectedDay} Cap: ₹{project.days_data[selectedDay - 1]?.expense_cap.toLocaleString()}
                  </span>
                </div>

                <form onSubmit={handleLogSpend} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Select Day (1 to 30)
                      </label>
                      <select
                        value={selectedDay}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          setSelectedDay(d);
                          const record = project.days_data[d - 1];
                          if (record && record.actual_spent > 0) {
                            setDailySpendAmount(record.actual_spent);
                          }
                        }}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {project.days_data.map(d => (
                          <option key={d.day} value={d.day}>
                            Day {d.day} {d.actual_spent > 0 ? `(Spent: ₹${d.actual_spent.toLocaleString()})` : `(Cap: ₹${d.expense_cap.toLocaleString()})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Actual Expense Amount (₹)</span>
                        <span className="text-[10px] text-slate-400">Current Allowance: ₹{project.days_data[selectedDay - 1]?.expense_cap.toLocaleString()}</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="10"
                        value={dailySpendAmount}
                        onChange={(e) => setDailySpendAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>

                  </div>

                  {/* Preset Quick Buttons to Test Overspending */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold">Test Scenarios (Click to test re-balancing):</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setDailySpendAmount(Math.round(project.days_data[selectedDay - 1]?.expense_cap * 0.7))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        ✅ Within Budget (~₹{Math.round(project.days_data[selectedDay - 1]?.expense_cap * 0.7).toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDailySpendAmount(Math.round(project.days_data[selectedDay - 1]?.expense_cap * 1.6))}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300 hover:bg-amber-900/60 transition-all cursor-pointer font-medium"
                      >
                        ⚡ Slight Overspend (~₹{Math.round(project.days_data[selectedDay - 1]?.expense_cap * 1.6).toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDailySpendAmount(3500)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300 hover:bg-rose-900/60 transition-all cursor-pointer font-medium"
                      >
                        🔥 Heavy Overspend (₹3,500)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDailySpendAmount(25000)}
                        title="Simulate an extreme spend that exceeds this month's discretionary pool and rolls deficit to future months"
                        className="px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-[11px] text-purple-300 hover:bg-purple-900/60 transition-all cursor-pointer font-medium"
                      >
                        ⚠️ Massive Shock (₹25,000)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-xs text-slate-400">
                      {dailySpendAmount > project.days_data[selectedDay - 1]?.expense_cap ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Will overspend Day {selectedDay} by ₹{(dailySpendAmount - project.days_data[selectedDay - 1]?.expense_cap).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Within Day {selectedDay}&apos;s allowance
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingSpend}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
                      <span>{isSubmittingSpend ? 'Updating Plan...' : 'Update Existing Project'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Explanation & Philosophy Card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>How In-Place Rebalancing Works</span>
                </div>
                <div className="mt-4 flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <strong className="text-white block mb-0.5">1. Update It, Not Make New</strong>
                    When an overspend occurs, your existing project data is updated directly. You don&apos;t get a cluttered mess of duplicate plans.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <strong className="text-white block mb-0.5">2. In-Month Rebalancing</strong>
                    The overspent amount is deducted from the remaining days of the current month so your target savings remain intact.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                    <strong className="text-white block mb-0.5">3. Further Months Absorption</strong>
                    If spending exceeds the entire month&apos;s discretionary pool, the unabsorbed deficit automatically rolls into subsequent months&apos; target savings.
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Active Project ID:</span>
                <span className="font-mono text-emerald-400">{project.id}</span>
              </div>
            </div>

          </div>
        )}

        {/* 6. FURTHER MONTHS RE-BALANCED PROJECTIONS ("Make a new one for further month ... update it") */}
        {project && (
          <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  <span>Further Months Projection (Automatically Re-balanced In-Place)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  How subsequent months are updated if an overspend occurs. If current month deficit rolls over, Month 2 target savings increases to maintain the overall milestone.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
                Next Month Adjusted Target: ₹{project.next_month_adjusted_target.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {project.future_months_projections.map((m) => {
                const isRecovery = m.status === 'rebalanced_recovery';
                return (
                  <div
                    key={m.month}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isRecovery
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/40'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className={isRecovery ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                          {m.month_name}
                        </span>
                        {isRecovery && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-extrabold uppercase">
                            Adjusted
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Savings</span>
                        <span className={`text-sm font-bold ${isRecovery ? 'text-amber-400' : 'text-cyan-400'}`}>
                          ₹{m.target_savings.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Discretionary Cap</span>
                        <span className="text-xs text-slate-300 font-medium">
                          ₹{m.monthly_expense_cap.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Cum. Saved:</span>
                      <strong className="text-emerald-400">₹{m.cumulative_saved.toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span>
                  The timeline dynamically keeps your target milestone of <strong className="text-white">₹{project.target_total_milestone.toLocaleString()}</strong> on schedule over {project.total_months} months.
                  All adjustments are persisted within this project plan so your financial roadmap stays organized.
                </span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
