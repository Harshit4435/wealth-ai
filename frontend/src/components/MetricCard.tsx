'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'text-emerald-400'
}: MetricCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-xl bg-slate-800/60 border border-white/5 ${accentColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
          <span className="text-slate-400 text-[11px] truncate">{subtext}</span>
        </div>
      </div>
    </div>
  );
}
