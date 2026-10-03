'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  Wallet, 
  Home, 
  Coins, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';
import { fetchUserProfile, updateUserProfile } from '@/lib/api';
import { UserProfile, SavingsPlan } from '@/lib/types';

interface FinancialPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated: (plan: SavingsPlan) => void;
}

export default function FinancialPlanModal({ isOpen, onClose, onPlanUpdated }: FinancialPlanModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    monthly_income: 65000,
    pays_rent: true,
    rent_amount: 18000,
    other_fixed_bills: 4200,
    savings_goal_type: 'Emergency Fund',
    goal_name: 'Emergency Reserve',
    target_savings_per_month: 15000,
    target_total_goal: 100000,
    savings_timeline_months: 12
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchUserProfile()
        .then((p) => {
          if (p) setProfile(p);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time live calculations
  const income = Number(profile.monthly_income) || 0;
  const rent = profile.pays_rent ? Number(profile.rent_amount) || 0 : 0;
  const bills = Number(profile.other_fixed_bills) || 0;
  const targetSavings = Number(profile.target_savings_per_month) || 0;
  const baseLiving = 6000;
  const fixedNeeds = rent + bills + baseLiving;
  const wants = Math.max(0, income - fixedNeeds - targetSavings);
  const dailyDiscretionary = Math.round(wants / 30);

  const fixedPct = income > 0 ? Math.round((fixedNeeds / income) * 100) : 0;
  const savingsPct = income > 0 ? Math.round((targetSavings / income) * 100) : 0;
  const wantsPct = Math.max(0, 100 - fixedPct - savingsPct);

  const goalTypes = [
    { type: 'Emergency Fund', label: '🛡️ Emergency Fund' },
    { type: 'Buy a Home', label: '🏡 Home Down Payment' },
    { type: 'Vehicle', label: '🚗 Car / Bike' },
    { type: 'Vacation', label: '✈️ Travel / Vacation' },
    { type: 'Wealth', label: '📈 Wealth & Compounding' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedPlan = await updateUserProfile(profile);
      onPlanUpdated(updatedPlan);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Personal Financial Questionnaire & Plan
              </h2>
              <p className="text-xs text-slate-400">
                Configure your monthly cash flow, housing rent, and target savings goal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            <span className="text-xs">Loading profile parameters...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Step 1 & 2: Income & Rent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Monthly Income */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Monthly Take-Home Income (₹)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={profile.monthly_income}
                    onChange={(e) => setProfile({ ...profile, monthly_income: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500">Your total net salary or earnings per month.</span>
              </div>

              {/* Rent Housing Toggle & Amount */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Monthly Rent (if any)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.pays_rent}
                      onChange={(e) => setProfile({ ...profile, pays_rent: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>Pay Rent?</span>
                  </label>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    disabled={!profile.pays_rent}
                    value={profile.pays_rent ? profile.rent_amount : 0}
                    onChange={(e) => setProfile({ ...profile, rent_amount: parseFloat(e.target.value) || 0 })}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl font-mono font-bold text-sm border transition-all ${
                      profile.pays_rent
                        ? 'bg-slate-900/90 border-white/10 text-white focus:outline-none focus:border-cyan-500/50'
                        : 'bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  {profile.pays_rent ? 'Monthly rent paid to landlord.' : 'No rent obligation (homeowner or living with family).'}
                </span>
              </div>

            </div>

            {/* Other Bills & Subscriptions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>Other Recurring Bills (Electricity, Internet, EMIs, Gas)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={profile.other_fixed_bills}
                  onChange={(e) => setProfile({ ...profile, other_fixed_bills: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>

            {/* Step 3: What do you want to save? */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Savings Goal
                </span>
              </div>

              {/* Goal Category Chips */}
              <div className="flex flex-wrap gap-2">
                {goalTypes.map((g) => (
                  <button
                    key={g.type}
                    type="button"
                    onClick={() => setProfile({ ...profile, savings_goal_type: g.type, goal_name: g.type })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      profile.savings_goal_type === g.type
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Target Monthly Savings & Target Total Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-400">Monthly Target Savings (₹/mo):</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={profile.target_savings_per_month}
                      onChange={(e) => setProfile({ ...profile, target_savings_per_month: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-400">Total Goal Target (₹):</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="1000"
                      step="5000"
                      value={profile.target_total_goal}
                      onChange={(e) => setProfile({ ...profile, target_total_goal: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold text-xs focus:outline-none focus:border-cyan-500/50"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Real-time Allocation Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Live Budget Allocation Preview</span>
                <span className="font-mono text-emerald-400 font-bold">
                  Safe Daily Allowance: ₹{dailyDiscretionary.toLocaleString()}/day
                </span>
              </div>

              {/* Progress Bar Stack */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div style={{ width: `${fixedPct}%` }} className="bg-emerald-500 h-full transition-all duration-300" title={`Needs: ${fixedPct}%`} />
                <div style={{ width: `${savingsPct}%` }} className="bg-cyan-400 h-full transition-all duration-300" title={`Savings: ${savingsPct}%`} />
                <div style={{ width: `${wantsPct}%` }} className="bg-amber-400 h-full transition-all duration-300" title={`Wants: ${wantsPct}%`} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="flex flex-col">
                  <span className="text-emerald-400 font-bold">Needs ({fixedPct}%)</span>
                  <span className="text-slate-400 font-mono">₹{fixedNeeds.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-cyan-400 font-bold">Savings ({savingsPct}%)</span>
                  <span className="text-slate-400 font-mono">₹{targetSavings.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-amber-400 font-bold">Wants ({wantsPct}%)</span>
                  <span className="text-slate-400 font-mono">₹{wants.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Computing Personalized Plan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Generate & Save Personalized Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
