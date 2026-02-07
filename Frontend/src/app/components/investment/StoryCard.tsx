import { Story } from '@/app/types/investment';
import { Clock } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  // Use the topic as the primary category tag
  const category = story.topic;
  // Use the hypothesis 'what' as the lead summary, fallback to story summary
  const summary = story.currentHypothesis?.what || story.summary;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer border-b border-[#e5e3df] py-6 last:border-0 hover:bg-[#faf9f6]/50 transition-colors px-2"
    >
      <div className="flex flex-col gap-2">
        {/* Meta Header */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#d4af37]">
            {category}
          </span>
          <span className="text-[11px] text-[#9ca3af] font-serif flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {story.lastUpdated}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-xl md:text-2xl font-serif text-[#1a1a1a] leading-tight group-hover:text-[#2c3e50] transition-colors font-medium">
          {story.title}
        </h3>

        {/* Lead/Hypothesis */}
        <p className="text-[15px] leading-relaxed text-[#4b5563] font-serif line-clamp-2 mt-1">
          {summary}
        </p>

        {/* Footer (Read More) */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-semibold text-[#2c3e50] uppercase tracking-wide border-b border-[#2c3e50]">
            Read Full Briefing
          </span>
        </div>
      </div>
    </div>
  );
}
