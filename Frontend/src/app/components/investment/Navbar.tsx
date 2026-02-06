import { Bell, CheckCircle2, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onRefreshNews?: () => void;
}

export function Navbar({ onRefreshNews }: NavbarProps) {
  return (
    <div className="fixed left-64 right-0 top-0 h-20 bg-white/80 backdrop-blur-md border-b-2 border-[#d4af37]/20 shadow-sm flex items-center justify-between px-8 z-10">
      {/* Left side - App name */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
        <div>
          <div className="text-[15px] font-serif text-[#2c3e50] font-medium">
            AI Investment Intelligence Platform
          </div>
          <div className="text-[11px] text-[#6b7280] uppercase tracking-wider">
            Market Analysis & Research
          </div>
        </div>
      </div>

      {/* Right side - Status and Profile */}
      <div className="flex items-center gap-4">
        {/* Refresh News Button */}
        {onRefreshNews && (
          <button
            onClick={onRefreshNews}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white rounded-full text-[14px] font-serif font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh News
          </button>
        )}

        {/* System Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-green-700 font-serif font-medium text-[13px]">System Online</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 hover:bg-[#faf9f6] rounded-lg transition-colors border border-transparent hover:border-[#e5e3df]">
          <Bell className="w-5 h-5 text-[#6b7280]" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Avatar */}
        <button className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center text-white text-[15px] font-serif font-semibold hover:shadow-lg transition-all transform hover:scale-105 border-2 border-white shadow-md">
          JD
        </button>
      </div>
    </div>
  );
}
