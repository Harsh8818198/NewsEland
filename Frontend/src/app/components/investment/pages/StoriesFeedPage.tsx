import { useState } from 'react';
import { StoryCard } from '../StoryCard';
import { useApiContext } from '../../../services/apiContext'
import { ErrorMessage, LoadingSkeleton } from '../../ErrorBoundary'

interface StoriesFeedPageProps {
  onStoryClick: (storyId: string) => void;
}

export function StoriesFeedPage({ onStoryClick }: StoriesFeedPageProps) {
  const apiContext = useApiContext();
  const { stories } = apiContext;
  const [topicFilter, setTopicFilter] = useState<string>('all');

  const topics = Array.from(new Set(stories.data.map((s) => s.topic)));

  const filteredStories = stories.data.filter((story) => {
    if (topicFilter !== 'all' && story.topic !== topicFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      {/* Header - News Branding */}
      <div className="border-b-4 border-[#1a1a1a] pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Global Wire
          </h1>
          <p className="text-lg text-[#6b7280] font-serif mt-2 italic">
            Live market intelligence and analysis
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-serif text-[#9ca3af]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {stories.error && (
        <ErrorMessage
          message={stories.error.userMessage}
          onRetry={() => apiContext.actions.fetchStories()}
        />
      )}

      {/* Simple Category Filter */}
      <div className="flex overflow-x-auto gap-6 pb-2 border-b border-[#e5e3df] scrollbar-hide">
        <button
          onClick={() => setTopicFilter('all')}
          className={`text-sm font-sans font-bold uppercase tracking-wider whitespace-nowrap pb-2 border-b-2 transition-colors ${topicFilter === 'all'
              ? 'border-[#d4af37] text-[#1a1a1a]'
              : 'border-transparent text-[#9ca3af] hover:text-[#4b5563]'
            }`}
        >
          All News
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setTopicFilter(topic)}
            className={`text-sm font-sans font-bold uppercase tracking-wider whitespace-nowrap pb-2 border-b-2 transition-colors ${topicFilter === topic
                ? 'border-[#d4af37] text-[#1a1a1a]'
                : 'border-transparent text-[#9ca3af] hover:text-[#4b5563]'
              }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {stories.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <LoadingSkeleton count={3} height="h-32" />
          </div>
          <div className="space-y-8">
            <LoadingSkeleton count={2} height="h-64" />
          </div>
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story.id)} />
            ))}
          </div>

          {/* Sidebar Column (Could be used for "Top Stories" or "Trending" later) */}
          <div className="hidden lg:block lg:col-span-4 border-l border-[#e5e3df] pl-12">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6">
              Market Focus
            </h3>
            <div className="text-sm text-[#6b7280] font-serif italic mb-4">
              Select a story to view the interactive relationship graph.
            </div>
            {/* Visual Placeholder for where the graph will be in the modal */}
            <div className="aspect-square bg-[#faf9f6] rounded-full border border-[#e5e3df] flex items-center justify-center opacity-50">
              <span className="text-[10px] text-[#9ca3af]">Network Visualization</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-xl text-[#6b7280] font-serif italic">
            No news available for this category.
          </p>
        </div>
      )}
    </div>
  );
}
