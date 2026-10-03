'use client';

import React from 'react';
import { ProactiveAlert } from '@/lib/types';
import { Bell, Lightbulb, TrendingUp, AlertTriangle, X, ArrowRight } from 'lucide-react';

interface ProactiveAlertsProps {
  alerts: ProactiveAlert[];
  onDismiss: (id: string) => void;
  onAction?: (alert: ProactiveAlert) => void;
}

export default function ProactiveAlerts({ alerts, onDismiss, onAction }: ProactiveAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-5 text-center text-xs text-slate-400">
        ✨ No urgent anomalies or spending surges detected. Your financial runway is stable.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'surge':
        return <Bell className="h-4 w-4 text-amber-400" />;
      case 'subscription':
        return <Lightbulb className="h-4 w-4 text-cyan-400" />;
      case 'savings_win':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/[0.04]';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/[0.04]';
      case 'info':
        return 'border-cyan-500/30 bg-cyan-500/[0.04]';
      default:
        return 'border-indigo-500/30 bg-indigo-500/[0.04]';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Proactive Financial Alerts</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        </h3>
        <span className="text-[11px] text-slate-500">Autonomous Daily Engine</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl p-4 border backdrop-blur-md relative flex flex-col justify-between transition-all hover:scale-[1.01] ${getBorderColor(
              alert.severity
            )}`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                    {getIcon(alert.type)}
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">{alert.title}</span>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.message}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
              <span className="text-slate-500">{alert.timestamp}</span>
              {alert.action_label && (
                <button
                  onClick={() => onAction && onAction(alert)}
                  className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span>{alert.action_label}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
