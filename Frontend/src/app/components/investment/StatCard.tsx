import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="text-[14px] text-[var(--fintech-text-secondary)] font-medium">{title}</div>
        {Icon && (
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--fintech-accent)]" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="text-[32px] font-semibold text-[var(--fintech-text-primary)]">{value}</div>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 text-[13px]">
          {trend && (
            <span
              className={
                trend.positive ? 'text-[var(--fintech-positive)]' : 'text-[var(--fintech-negative)]'
              }
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-[var(--fintech-text-muted)]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
