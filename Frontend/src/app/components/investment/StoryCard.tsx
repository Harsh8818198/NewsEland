import { Story } from '@/app/types/investment';
import { SentimentBadge, MaturityBadge } from './Badge';
import { Clock, TrendingUp, BookOpen } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const keyEventType = story.currentHypothesis?.key_event_type || 
    (story.updates.length > 0 ? story.updates[0].keyEventType : null);
  const sentimentScore = story.sentimentScore || 0;
  const summary = story.currentHypothesis?.what || story.summary;
  
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-br from-[#faf9f6] to-white border border-[#e5e3df] rounded-xl p-6 text-left hover:shadow-xl hover:border-[#d4af37]/50 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#d4af37]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Header with elegant typography */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs uppercase tracking-wider text-[#6b7280] font-medium">
              {story.topic}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-serif text-[#2c3e50] mb-2 line-clamp-2 leading-tight group-hover:text-[#d4af37] transition-colors">
            {story.title}
          </h3>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <MaturityBadge maturity={story.maturity} size="sm" />
          <SentimentBadge sentiment={story.sentiment} size="sm" />
        </div>
      </div>

      {/* Key Event Type Badge - Elegant */}
      {keyEventType && keyEventType !== 'None' && (
        <div className="mb-4">
          <span className="px-3 py-1.5 bg-gradient-to-r from-[#d4af37]/10 to-[#b8941f]/10 text-[#b8941f] rounded-full text-xs font-medium border border-[#d4af37]/30 shadow-sm">
            {keyEventType}
          </span>
        </div>
      )}

      {/* Summary / Hypothesis What - Novel-like text */}
      <p className="text-base text-[#4a5568] mb-5 line-clamp-3 leading-relaxed font-serif group-hover:text-[#3d4f63] transition-colors">
        {summary}
      </p>

      {/* Meta info - Professional footer */}
      <div className="flex items-center gap-4 text-sm text-[#6b7280] flex-wrap pt-4 border-t border-[#e5e3df]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#d4af37]" />
          <span className="font-serif">{story.updateCount} updates</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#9ca3af]" />
          <span className="font-serif">{story.lastUpdated}</span>
        </div>
        {sentimentScore !== 0 && (
          <div className="ml-auto px-3 py-1 bg-white border border-[#e5e3df] rounded-full text-xs font-serif font-semibold text-[#2c3e50] shadow-sm">
            {sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)}
          </div>
        )}
      </div>

      {/* Hover effect indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </button>
  );
}
