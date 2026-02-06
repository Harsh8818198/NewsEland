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
    <div className="bg-gradient-to-br from-white to-[#faf9f6] border border-[#e5e3df] rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#d4af37]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="text-sm text-[#6b7280] font-serif uppercase tracking-wider">{title}</div>
        {Icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/10 to-[#b8941f]/10 rounded-xl flex items-center justify-center border border-[#d4af37]/20 group-hover:border-[#d4af37]/40 transition-colors">
            <Icon className="w-6 h-6 text-[#d4af37]" />
          </div>
        )}
      </div>

      <div className="mb-3 relative z-10">
        <div className="text-4xl font-serif text-[#2c3e50] font-bold group-hover:text-[#d4af37] transition-colors">{value}</div>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 text-sm font-serif relative z-10">
          {trend && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                trend.positive 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-[#6b7280]">{subtitle}</span>}
        </div>
      )}

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}
