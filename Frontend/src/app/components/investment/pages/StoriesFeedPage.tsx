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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
          Stories Feed
        </h1>
        <p className="text-[15px] text-[var(--fintech-text-secondary)]">
          Tracking {stories.data.length} market stories and developments
        </p>
      </div>

      {/* Error Display */}
      {stories.error && (
        <ErrorMessage
          message={stories.error.userMessage}
          onRetry={() => apiContext.actions.fetchStories()}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[14px] text-[var(--fintech-text-secondary)] font-medium">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[14px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
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
            className="px-3 py-2 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[14px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
          >
            <option value="all">All Maturity</option>
            <option value="Developing">Developing</option>
            <option value="Mature">Mature</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as Sentiment | 'all')}
            className="px-3 py-2 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[14px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {/* Results count */}
          <div className="ml-auto text-[14px] text-[var(--fintech-text-muted)]">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {stories.loading ? (
        <LoadingSkeleton count={4} height="h-32" />
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-12 text-center">
          <p className="text-[15px] text-[var(--fintech-text-secondary)]">
            {stories.data.length === 0 ? 'No stories available' : 'No stories match your filter criteria'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
          Stories Feed
        </h1>
        <p className="text-[15px] text-[var(--fintech-text-secondary)]">
          Tracking {mockStories.length} market stories and developments
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[14px] text-[var(--fintech-text-secondary)] font-medium">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[14px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
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
            className="px-3 py-2 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[14px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
          >
            <option value="all">All Maturity</option>
            <option value="Developing">Developing</option>
            <option value="Mature">Mature</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as Sentiment | 'all')}
            className="px-3 py-2 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[14px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {/* Results count */}
          <div className="ml-auto text-[14px] text-[var(--fintech-text-muted)]">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredStories.map((story) => (
          <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story.id)} />
        ))}
      </div>

      {/* Empty State */}
      {filteredStories.length === 0 && (
        <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-12 text-center">
          <p className="text-[15px] text-[var(--fintech-text-secondary)]">
            No stories match your filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
