'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowUpRight, 
  Loader2, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Wrench 
} from 'lucide-react';
import { queryCopilot } from '@/lib/api';
import { CopilotResponse } from '@/lib/types';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  data?: CopilotResponse;
  timestamp: string;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'copilot',
      text: "Hello Harshit! I am your AI Financial Copilot. Unlike generic chat models, I never guess or invent financial numbers. I query your deterministic cash flow tools, upcoming commitments, and category run-rates before reasoning about your decisions.\n\nTry asking me: \"Can I afford a ₹20,000 phone this month?\" or \"Where am I overspending?\"",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "Can I afford a ₹20,000 phone this month?",
    "Where am I overspending?",
    "How much did I spend on food?",
    "How much can I save this month?"
  ];

  const handleSend = async (textToSend: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryCopilot(q);
      const copilotMsg: Message = {
        id: `msg_${Date.now()}_c`,
        sender: 'copilot',
        text: response.answer,
        data: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 lg:px-8 pt-8 flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Bot className="h-7 w-7 text-cyan-400" />
              <span>AI Financial Copilot</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Autonomous reasoning layer backed by deterministic tools and mathematical models.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
            <Calculator className="h-4 w-4" />
            <span>Deterministic Math Active</span>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{p}</span>
              <ArrowUpRight className="h-3 w-3 text-slate-500" />
            </button>
          ))}
        </div>

        {/* Chat Thread */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex-1 flex flex-col gap-6 min-h-[480px]">
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-2 max-w-[85%] ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span>{m.sender === 'user' ? 'You' : 'Wealth AI Copilot'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/10 rounded-tr-none'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200 shadow-xl rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.text}

                  {/* Calculations Inspector Box */}
                  {m.data?.calculations && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                        <Coins className="h-3.5 w-3.5" />
                        <span>Deterministic Tool Calculations</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Current Liquid</span>
                          <span className="text-white font-bold text-xs">
                            ₹{m.data.calculations.current_liquid_balance.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Upcoming Bills</span>
                          <span className="text-white font-bold text-xs">
                            ₹{m.data.calculations.fixed_expenses_remaining.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Purchase Cost</span>
                          <span className="text-amber-400 font-bold text-xs">
                            ₹{m.data.calculations.purchase_amount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Buffer If Bought Now</span>
                          <span
                            className={`font-bold text-xs ${
                              m.data.calculations.projected_buffer_now >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            ₹{m.data.calculations.projected_buffer_now.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Tool Execution Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
                        <Wrench className="h-3 w-3 text-slate-400" />
                        <span>Tools called:</span>
                        {m.data.tools_called.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="self-start flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-400 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Simulating financial cash flow tools & executing projections...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative mt-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. 'Can I afford ₹20k phone this month?')..."
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
