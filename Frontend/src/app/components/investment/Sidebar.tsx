import {
  LayoutDashboard,
  Newspaper,
  Sparkles,
  User,
  Activity,
  Brain,
  Wallet,
} from 'lucide-react';

type Page =
  | 'dashboard'
  | 'stories'
  | 'analyzer'
  | 'profile'
  | 'decision-logic'
  | 'portfolio'
  | 'system-status';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stories' as Page, label: 'Stories Feed', icon: Newspaper },
    { id: 'analyzer' as Page, label: 'Analyzer', icon: Sparkles },
    { id: 'profile' as Page, label: 'Profile', icon: User },
    { id: 'decision-logic' as Page, label: 'Decision Logic', icon: Brain },
    { id: 'portfolio' as Page, label: 'Portfolio', icon: Wallet },
    { id: 'system-status' as Page, label: 'System Status', icon: Activity },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#2c3e50] to-[#34495e] border-r-2 border-[#1a252f] flex flex-col shadow-2xl">
      {/* Logo - Elegant Header */}
      <div className="h-20 flex items-center px-6 border-b-2 border-[#1a252f] bg-gradient-to-r from-[#1a252f] to-[#2c3e50]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[20px] font-serif text-white font-light tracking-wide block leading-tight">
              InvestIntel
            </span>
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">
              Intelligence Platform
            </span>
          </div>
        </div>
      </div>

      {/* Navigation - Elegant Menu */}
      <nav className="flex-1 py-6 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full px-4 py-3.5 flex items-center gap-3 text-[15px] font-serif transition-all duration-200 rounded-lg mb-1
                ${isActive
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white shadow-lg transform scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/60'}`} />
              <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1a252f]/50">
        <div className="text-xs text-white/50 font-serif text-center">
          Market Intelligence
          <br />
          <span className="text-[10px]">© 2024</span>
        </div>
      </div>
    </div>
  );
}
