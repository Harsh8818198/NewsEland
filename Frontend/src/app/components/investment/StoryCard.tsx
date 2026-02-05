import { Story } from '@/app/types/investment';
import { SentimentBadge, MaturityBadge } from './Badge';
import { Clock, TrendingUp } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 text-left hover:border-[var(--fintech-accent)] hover:shadow-md transition-all"
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-2 line-clamp-2">
            {story.title}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <MaturityBadge maturity={story.maturity} size="sm" />
          <SentimentBadge sentiment={story.sentiment} size="sm" />
        </div>
      </div>

      {/* Summary */}
      <p className="text-[14px] text-[var(--fintech-text-secondary)] mb-4 line-clamp-2">
        {story.summary}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-[13px] text-[var(--fintech-text-muted)]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          <span>{story.updateCount} updates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{story.lastUpdated}</span>
        </div>
        <div className="px-2 py-0.5 bg-[var(--fintech-bg)] rounded text-[12px]">{story.topic}</div>
      </div>
    </button>
  );
}
