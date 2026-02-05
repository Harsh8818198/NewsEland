import { Story } from '@/app/types/investment';
import { SentimentBadge, MaturityBadge } from './Badge';
import { X, Clock, Tag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface StoryDetailsModalProps {
  story: Story;
  onClose: () => void;
}

export function StoryDetailsModal({ story, onClose }: StoryDetailsModalProps) {
  // Transform sentiment history for chart
  const chartData = story.sentimentHistory.map((point) => ({
    name: point.date,
    value: point.value,
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-[var(--fintech-card)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--fintech-border)] flex items-start justify-between">
          <div className="flex-1 pr-8">
            <h2 className="text-[24px] font-semibold text-[var(--fintech-text-primary)] mb-3">
              {story.title}
            </h2>
            <div className="flex items-center gap-3">
              <MaturityBadge maturity={story.maturity} />
              <SentimentBadge sentiment={story.sentiment} />
              <span className="text-[13px] text-[var(--fintech-text-muted)]">
                {story.updateCount} updates
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[var(--fintech-bg)] rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-[var(--fintech-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* Summary */}
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-3">
              Summary
            </h3>
            <p className="text-[15px] text-[var(--fintech-text-secondary)] leading-relaxed">
              {story.summary}
            </p>
          </div>

          {/* Maturity Progress */}
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-3">
              Story Maturity
            </h3>
            <div className="bg-[var(--fintech-bg)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] text-[var(--fintech-text-secondary)]">
                  Current Stage: {story.maturity}
                </span>
                <span className="text-[14px] text-[var(--fintech-text-muted)]">
                  {story.updateCount} data points
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-[var(--fintech-border)]">
                <div
                  className="bg-[var(--fintech-accent)] h-full transition-all"
                  style={{ width: story.maturity === 'Mature' ? '100%' : '45%' }}
                />
              </div>
            </div>
          </div>

          {/* Sentiment Over Time */}
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-3">
              Sentiment Over Time
            </h3>
            <div className="bg-[var(--fintech-bg)] rounded-lg p-6">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--fintech-border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--fintech-text-muted)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--fintech-border)' }}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    tick={{ fill: 'var(--fintech-text-muted)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--fintech-border)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--fintech-card)',
                      border: '1px solid var(--fintech-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--fintech-accent)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--fintech-accent)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline of Updates */}
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-4">
              Timeline of Updates
            </h3>
            <div className="space-y-4">
              {story.updates.map((update) => (
                <div
                  key={update.id}
                  className="flex gap-4 pb-4 border-b border-[var(--fintech-border)] last:border-0"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-[#EEF2FF] rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-[var(--fintech-accent)] rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[var(--fintech-text-muted)]" />
                      <span className="text-[13px] text-[var(--fintech-text-muted)]">
                        {update.timestamp}
                      </span>
                      <SentimentBadge sentiment={update.sentiment} size="sm" />
                    </div>
                    <p className="text-[15px] text-[var(--fintech-text-primary)]">
                      {update.headline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Entities */}
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-3">
              Related Entities
            </h3>
            <div className="flex flex-wrap gap-2">
              {story.relatedEntities.map((entity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-md text-[13px] text-[var(--fintech-text-secondary)]"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {entity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
