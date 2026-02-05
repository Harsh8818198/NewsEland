import { HelpCircle, MessageSquare } from 'lucide-react';

interface NavigationProps {
  onMethodologyClick: () => void;
  onAskSystemClick: () => void;
}

export function Navigation({ onMethodologyClick, onAskSystemClick }: NavigationProps) {
  return (
    <nav className="border-b border-[var(--intel-border)] bg-[var(--intel-bg-white)]">
      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="intel-text-heading text-[15px] tracking-tight">
            Intelligence Brief
          </h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onAskSystemClick}
            className="flex items-center gap-2 px-4 py-2 intel-text-body text-[14px] hover:bg-[var(--intel-bg-secondary)] transition-colors rounded-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Ask
          </button>
          
          <button
            onClick={onMethodologyClick}
            className="flex items-center gap-2 px-4 py-2 intel-text-body text-[14px] hover:bg-[var(--intel-bg-secondary)] transition-colors rounded-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Methodology
          </button>
        </div>
      </div>
    </nav>
  );
}
