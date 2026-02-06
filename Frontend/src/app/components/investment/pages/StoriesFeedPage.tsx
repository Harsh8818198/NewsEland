import { useState } from 'react';
import { StoryCard } from '../StoryCard';
import { Sentiment, Maturity } from '../../../types/investment'
import { Filter } from 'lucide-react'
import { useApiContext } from '../../../services/apiContext'
import { ErrorMessage, LoadingSkeleton } from '../../ErrorBoundary'

interface StoriesFeedPageProps {
  onStoryClick: (storyId: string) => void;
}

export function StoriesFeedPage({ onStoryClick }: StoriesFeedPageProps) {
  const apiContext = useApiContext();
  const { stories } = apiContext;
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [maturityFilter, setMaturityFilter] = useState<Maturity | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');

  const topics = Array.from(new Set(stories.data.map((s) => s.topic)));

  const filteredStories = stories.data.filter((story) => {
    if (topicFilter !== 'all' && story.topic !== topicFilter) return false;
    if (maturityFilter !== 'all' && story.maturity !== maturityFilter) return false;
    if (sentimentFilter !== 'all' && story.sentiment !== sentimentFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header - Professional Paper Style */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-12 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
          <div>
            <h1 className="text-4xl font-serif text-[#2c3e50] font-light tracking-tight mb-2">
              Stories Feed
            </h1>
            <p className="text-base text-[#6b7280] font-serif">
              Tracking {stories.data.length} market stories and developments
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {stories.error && (
        <ErrorMessage
          message={stories.error.userMessage}
          onRetry={() => apiContext.actions.fetchStories()}
        />
      )}

      {/* Filter Bar - Elegant Design */}
      <div className="bg-gradient-to-br from-white/80 to-[#faf9f6] backdrop-blur-sm border-2 border-[#e5e3df] rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-[#6b7280] font-serif uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#d4af37]" />
            <span>Filters:</span>
          </div>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-[#e5e3df] rounded-lg text-sm text-[#2c3e50] font-serif focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all shadow-sm hover:shadow-md"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {/* Maturity Filter */}
          <select
            value={maturityFilter}
            onChange={(e) => setMaturityFilter(e.target.value as Maturity | 'all')}
            className="px-4 py-2.5 bg-white border-2 border-[#e5e3df] rounded-lg text-sm text-[#2c3e50] font-serif focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all shadow-sm hover:shadow-md"
          >
            <option value="all">All Maturity</option>
            <option value="Developing">Developing</option>
            <option value="Mature">Mature</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as Sentiment | 'all')}
            className="px-4 py-2.5 bg-white border-2 border-[#e5e3df] rounded-lg text-sm text-[#2c3e50] font-serif focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all shadow-sm hover:shadow-md"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {/* Results count */}
          <div className="ml-auto px-4 py-2 bg-gradient-to-r from-[#d4af37]/10 to-[#b8941f]/10 border border-[#d4af37]/30 rounded-lg text-sm text-[#2c3e50] font-serif font-medium">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {stories.loading ? (
        <LoadingSkeleton count={4} height="h-32" />
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/80 to-[#faf9f6] backdrop-blur-sm border-2 border-[#e5e3df] rounded-xl p-16 text-center shadow-lg">
          <p className="text-lg text-[#6b7280] font-serif">
            {stories.data.length === 0 ? 'No stories available' : 'No stories match your filter criteria'}
          </p>
        </div>
      )}
    </div>
  );
}
