'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  LayoutDashboard, 
  Receipt, 
  HeartPulse, 
  TrendingUp, 
  Bot, 
  PlusCircle,
  Target
} from 'lucide-react';

interface NavbarProps {
  onOpenQuickAdd?: () => void;
}

export default function Navbar({ onOpenQuickAdd }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Savings Plan', href: '/plan', icon: Target },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Financial Health', href: '/health', icon: HeartPulse },
    { name: 'Spending Forecast', href: '/forecast', icon: TrendingUp },
    { name: 'AI Copilot', href: '/copilot', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse-subtle" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Wealth <span className="text-emerald-400 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Financial Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>ML Engine Active</span>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

      </div>
    </header>
  );
}
