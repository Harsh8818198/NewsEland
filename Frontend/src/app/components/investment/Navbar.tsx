import { Bell, CheckCircle2 } from 'lucide-react';

export function Navbar() {
  return (
    <div className="fixed left-64 right-0 top-0 h-16 bg-[var(--fintech-card)] border-b border-[var(--fintech-border)] flex items-center justify-between px-8 z-10">
      {/* Left side - App name */}
      <div className="text-[14px] text-[var(--fintech-text-secondary)]">
        AI Investment Intelligence Platform
      </div>

      {/* Right side - Status and Profile */}
      <div className="flex items-center gap-6">
        {/* System Status Indicator */}
        <div className="flex items-center gap-2 text-[14px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-md">
            <CheckCircle2 className="w-4 h-4 text-[var(--fintech-success)]" />
            <span className="text-[var(--fintech-success)] font-medium text-[13px]">System Online</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-[var(--fintech-bg)] rounded-md transition-colors">
          <Bell className="w-5 h-5 text-[var(--fintech-text-secondary)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--fintech-accent)] rounded-full" />
        </button>

        {/* Profile Avatar */}
        <button className="w-9 h-9 bg-[var(--fintech-accent)] rounded-full flex items-center justify-center text-white text-[14px] font-medium hover:bg-[var(--fintech-accent-hover)] transition-colors">
          JD
        </button>
      </div>
    </div>
  );
}
