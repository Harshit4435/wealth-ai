'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MetricCard from '@/components/MetricCard';
import HealthGauge from '@/components/HealthGauge';
import SpendingChart from '@/components/SpendingChart';
import ProactiveAlerts from '@/components/ProactiveAlerts';
import QuickAddModal from '@/components/QuickAddModal';
import FinancialPlanModal from '@/components/FinancialPlanModal';
import { 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  ShieldAlert, 
  Bot, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  Send,
  Loader2,
  Sparkles,
  AlertTriangle,
  Target,
  Sliders
} from 'lucide-react';
import { 
  fetchTransactions, 
  fetchHealthScore, 
  fetchAlerts, 
  dismissAlert, 
  queryCopilot, 
  correctCategory,
  fetchSavingsPlan
} from '@/lib/api';
import { Transaction, FinancialHealthScore, ProactiveAlert, CopilotResponse, SavingsPlan } from '@/lib/types';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [health, setHealth] = useState<FinancialHealthScore | null>(null);
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [plan, setPlan] = useState<SavingsPlan | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  
  // Copilot quick chat state
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResult, setCopilotResult] = useState<CopilotResponse | null>(null);

  // Category correction popup
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const categoriesList = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Utilities', 'Housing', 'Health', 'Investment'];

  useEffect(() => {
    async function loadData() {
      const [txs, h, al, p] = await Promise.all([
        fetchTransactions(),
        fetchHealthScore(),
        fetchAlerts(),
        fetchSavingsPlan()
      ]);
      setTransactions(txs);
      setHealth(h);
      setAlerts(al);
      setPlan(p);
    }
    loadData();
  }, []);

  const handleDismissAlert = async (id: string) => {
    await dismissAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTransactionAdded = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleCopilotAsk = async (queryText: string) => {
    const q = queryText || copilotInput;
    if (!q.trim() || copilotLoading) return;
    setCopilotLoading(true);
    try {
      const res = await queryCopilot(q);
      setCopilotResult(res);
      setCopilotInput(q);
    } catch (e) {
      console.error(e);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleCorrectCategory = async (txId: string, newCat: string) => {
    await correctCategory(txId, newCat);
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, category: newCat, confidence: 1.0 } : t))
    );
    setEditingTxId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-16">
      <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex flex-col gap-8">
        
        {/* Welcome Briefing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Financial Intelligence Overview</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live Pulse
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Autonomous financial analysis, ML auto-categorization & copilot decision support.
            </p>
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Quick Add ("Spent 450 on...")</span>
          </button>
        </div>

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Income"
            value="₹65,000"
            subtext="Salary direct deposit"
            icon={Wallet}
            trend="+100%"
            trendPositive={true}
            accentColor="text-emerald-400"
          />
          <MetricCard
            title="Monthly Spend"
            value="₹43,200"
            subtext="Current October run-rate"
            icon={CreditCard}
            trend="+12.9%"
            trendPositive={false}
            accentColor="text-amber-400"
          />
          <MetricCard
            title="Projected Savings"
            value="₹21,800"
            subtext="33.5% savings rate"
            icon={PiggyBank}
            trend="+₹6,400"
            trendPositive={true}
            accentColor="text-cyan-400"
          />
          <MetricCard
            title="Safe Cash Buffer"
            value="₹8,900"
            subtext="Next salary in 12 days"
            icon={ShieldAlert}
            trend="Safe"
            trendPositive={true}
            accentColor="text-indigo-400"
          />
        </div>

        {/* Proactive Alerts Feed */}
        <ProactiveAlerts
          alerts={alerts}
          onDismiss={handleDismissAlert}
          onAction={(a) => {
            if (a.type === 'surge') handleCopilotAsk('Where am I overspending?');
          }}
        />

        {/* Personalized Financial Plan Blueprint Banner */}
        {plan && (
          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/25 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                <Target className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Your Personalized Financial Blueprint</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active Plan
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Income: <strong className="text-white font-mono">₹{plan.monthly_income.toLocaleString()}</strong> • 
                  Rent: <strong className="text-cyan-300 font-mono">{plan.rent_amount > 0 ? `₹${plan.rent_amount.toLocaleString()}` : '₹0 (No rent)'}</strong> • 
                  Savings Target: <strong className="text-emerald-400 font-mono">₹{plan.target_savings.toLocaleString()}/mo</strong> • 
                  Safe Daily Burn: <strong className="text-amber-300 font-mono">₹{Math.round(plan.daily_discretionary_budget).toLocaleString()}/day</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                <span>Adjust Parameters</span>
              </button>
              <a
                href="/plan"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>View Full Chart & Timeline</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* 2-Column Section: Health Engine & Velocity Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            {health ? (
              <HealthGauge health={health} />
            ) : (
              <div className="glass-panel rounded-2xl p-6 h-64 flex items-center justify-center text-slate-500 text-xs">
                Computing 5-pillar financial profile...
              </div>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <SpendingChart />
          </div>
        </div>

        {/* 2-Column Section: Transactions with ML Feedback & AI Copilot Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Recent Transactions Table */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Auto-categorized by ML with active feedback loop</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {transactions.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-1">Merchant</th>
                    <th className="pb-3">ML Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right pr-1">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {transactions.slice(0, 7).map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      {/* Merchant */}
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${tx.transaction_type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                            {tx.transaction_type === 'income' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {tx.merchant}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {tx.description}
                            </span>
                            {tx.is_anomaly && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                                <AlertTriangle className="h-3 w-3" />
                                Unusual Activity
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ML Category & Correction trigger */}
                      <td className="py-3 relative">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingTxId(editingTxId === tx.id ? null : tx.id)}
                            className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-[11px] text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Click to correct category (retrains ML)"
                          >
                            <span>{tx.category}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {Math.round(tx.confidence * 100)}%
                            </span>
                          </button>
                        </div>

                        {/* Inline Category Correction Dropdown */}
                        {editingTxId === tx.id && (
                          <div className="absolute top-10 left-0 z-40 bg-slate-900 border border-emerald-500/30 rounded-xl p-2 shadow-2xl w-48 flex flex-col gap-1 animate-in fade-in duration-150">
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                              Correct & Retrain ML:
                            </span>
                            {categoriesList.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => handleCorrectCategory(tx.id, cat)}
                                className={`px-2 py-1 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  tx.category === cat
                                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                                    : 'text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                <span>{cat}</span>
                                {tx.category === cat && <Check className="h-3 w-3" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 text-slate-400 text-[11px]">
                        {tx.transaction_date}
                      </td>

                      {/* Amount */}
                      <td className="py-3 pr-1 text-right">
                        <span className={`font-mono font-bold ${tx.transaction_type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {tx.transaction_type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-white/5">
              <span>💡 Tap any category tag to correct it and reinforce ML model weights.</span>
              <a href="/transactions" className="text-emerald-400 font-semibold hover:underline">
                View all &rarr;
              </a>
            </div>
          </div>

          {/* AI Financial Copilot Section */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">AI Financial Copilot</h3>
                  <p className="text-xs text-slate-400">Deterministic math + LLM reasoning layer</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Tool Engine
              </span>
            </div>

            {/* Simulation Question Chips */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Quick Simulations:</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleCopilotAsk("Can I afford a ₹20,000 phone this month?")}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-left text-xs text-slate-200 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>"Can I afford a ₹20,000 phone this month?"</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleCopilotAsk("Where am I overspending?")}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-left text-xs text-slate-200 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>"Where am I overspending?"</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleCopilotAsk("How much can I save this month?")}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-left text-xs text-slate-200 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>"How much can I save this month?"</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>
            </div>

            {/* Interactive Query Input */}
            <div className="relative mt-1">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCopilotAsk(copilotInput)}
                placeholder="Ask financial copilot anything..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all pr-10"
              />
              <button
                onClick={() => handleCopilotAsk(copilotInput)}
                disabled={copilotLoading || !copilotInput.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {copilotLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Copilot Result Box */}
            {copilotResult && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-semibold border-b border-white/5 pb-2">
                  <span>Intent: {copilotResult.intent}</span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    Tools: {copilotResult.tools_called.join(', ')}
                  </span>
                </div>

                <div className="text-slate-200 leading-relaxed whitespace-pre-line text-xs font-normal">
                  {copilotResult.answer}
                </div>

                {copilotResult.calculations && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Current Liquid:</span>
                      <span className="text-white font-bold">₹{copilotResult.calculations.current_liquid_balance.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Upcoming Bills:</span>
                      <span className="text-white font-bold">₹{copilotResult.calculations.fixed_expenses_remaining.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Projected Buffer Now:</span>
                      <span className={copilotResult.calculations.projected_buffer_now >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        ₹{copilotResult.calculations.projected_buffer_now.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Wait Salary Buffer:</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{copilotResult.calculations.projected_buffer_wait_salary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />

      {/* Financial Plan Questionnaire Modal */}
      <FinancialPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onPlanUpdated={(newPlan) => setPlan(newPlan)}
      />
    </div>
  );
}
