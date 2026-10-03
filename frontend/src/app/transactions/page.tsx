'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import QuickAddModal from '@/components/QuickAddModal';
import { 
  Receipt, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Upload, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';
import { fetchTransactions, correctCategory, parseNaturalLanguageTransaction } from '@/lib/api';
import { Transaction } from '@/lib/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);

  const categories = ['All', 'Food', 'Transportation', 'Shopping', 'Entertainment', 'Utilities', 'Housing', 'Health', 'Investment', 'Salary'];

  useEffect(() => {
    async function load() {
      const data = await fetchTransactions();
      setTransactions(data);
    }
    load();
  }, []);

  const handleCorrectCategory = async (txId: string, newCat: string) => {
    await correctCategory(txId, newCat);
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, category: newCat, confidence: 1.0 } : t))
    );
    setEditingTxId(null);
    setFeedbackSuccess(`ML model reinforced! Future transactions for this pattern will categorize under ${newCat}.`);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  const handleCsvUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvNotice(`Processed statement "${e.target.files[0].name}". 18 new transactions parsed and auto-categorized by ML.`);
      setTimeout(() => setCsvNotice(null), 5000);
    }
  };

  const filtered = transactions.filter((tx) => {
    const matchesCat = selectedCategory === 'All' || tx.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-16">
      <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-8 flex flex-col gap-6">
        
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Receipt className="h-7 w-7 text-emerald-400" />
              <span>Transaction Intelligence</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Automated ingestion, ML classification with continuous feedback correction, and anomaly scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-slate-400" />
              <span>Import Bank CSV</span>
              <input type="file" accept=".csv" onChange={handleCsvUploadMock} className="hidden" />
            </label>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Notices */}
        {feedbackSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}
        {csvNotice && (
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{csvNotice}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search merchant, notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Merchant & Description</th>
                  <th className="pb-3">ML Category Tag</th>
                  <th className="pb-3">Subcategory</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Merchant */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tx.transaction_type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                          {tx.transaction_type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                            {tx.merchant}
                          </span>
                          <span className="text-xs text-slate-400">
                            {tx.description}
                          </span>
                          {tx.is_anomaly && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400 mt-1 font-semibold">
                              <AlertTriangle className="h-3 w-3" />
                              {tx.anomaly_reason || 'Unusual Spending Spike'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ML Category & Inline Retrain */}
                    <td className="py-3.5 relative">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingTxId(editingTxId === tx.id ? null : tx.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/20 text-xs text-emerald-300 hover:border-emerald-500/50 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Click to correct category (retrains ML)"
                        >
                          <span className="font-semibold">{tx.category}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {Math.round(tx.confidence * 100)}%
                          </span>
                        </button>
                      </div>

                      {/* Dropdown */}
                      {editingTxId === tx.id && (
                        <div className="absolute top-12 left-0 z-40 bg-slate-900 border border-emerald-500/30 rounded-xl p-2 shadow-2xl w-48 flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                            Correct Category:
                          </span>
                          {categories.filter(c => c !== 'All').map((cat) => (
                            <button
                              key={cat}
                              onClick={() => handleCorrectCategory(tx.id, cat)}
                              className={`px-2 py-1 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                tx.category === cat ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <span>{cat}</span>
                              {tx.category === cat && <Check className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Subcategory */}
                    <td className="py-3.5 text-slate-400 text-xs">
                      {tx.subcategory}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 text-slate-400 text-xs font-mono">
                      {tx.transaction_date}
                    </td>

                    {/* Source */}
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-white/5">
                        {tx.source}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 pr-2 text-right">
                      <span className={`font-mono text-sm font-bold ${tx.transaction_type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                        {tx.transaction_type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onTransactionAdded={(newTx) => setTransactions((prev) => [newTx, ...prev])}
      />
    </div>
  );
}
