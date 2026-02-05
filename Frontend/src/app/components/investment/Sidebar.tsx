import {
  LayoutDashboard,
  Newspaper,
  Sparkles,
  User,
  Activity,
  Brain,
} from 'lucide-react';

type Page =
  | 'dashboard'
  | 'stories'
  | 'analyzer'
  | 'profile'
  | 'decision-logic'
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
    { id: 'system-status' as Page, label: 'System Status', icon: Activity },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[var(--fintech-sidebar)] border-r border-[var(--fintech-border)] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--fintech-border)]">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[var(--fintech-accent)]" />
          <span className="text-[18px] font-semibold text-[var(--fintech-text-primary)]">
            InvestIntel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full px-6 py-3 flex items-center gap-3 text-[15px] transition-colors
                ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[var(--fintech-accent)] font-medium'
                    : 'text-[var(--fintech-text-secondary)] hover:bg-[var(--fintech-bg)] hover:text-[var(--fintech-text-primary)]'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
