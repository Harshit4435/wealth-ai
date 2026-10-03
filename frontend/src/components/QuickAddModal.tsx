'use client';

import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { parseNaturalLanguageTransaction } from '@/lib/api';
import { Transaction } from '@/lib/types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: (tx: Transaction) => void;
}

export default function QuickAddModal({ isOpen, onClose, onTransactionAdded }: QuickAddModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    "Spent 450 on dinner with friends",
    "Swiggy 438",
    "Uber 216",
    "Amazon 1299 electronics",
    "Paid ₹2,150 for electricity bill"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setSuccessTx(null);
    try {
      const parsed = await parseNaturalLanguageTransaction(input);
      setSuccessTx(parsed);
      onTransactionAdded(parsed);
      setTimeout(() => {
        setInput('');
        setSuccessTx(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-5 w-5 animate-pulse-subtle" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">AI Transaction Entry</h3>
              <p className="text-xs text-slate-400">Natural language parsed automatically with ML categorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Spent 450 on dinner with friends"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Parse</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 items-center mt-1">
            <span className="text-[11px] text-slate-500 font-medium">Try:</span>
            {samplePrompts.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setInput(p)}
                className="px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 border border-white/5 text-[11px] text-slate-300 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Success Banner */}
          {successTx && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>
                  Categorized as <strong>{successTx.category} ({successTx.subcategory})</strong> • ₹{successTx.amount}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">
                {Math.round(successTx.confidence * 100)}% Conf
              </span>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
