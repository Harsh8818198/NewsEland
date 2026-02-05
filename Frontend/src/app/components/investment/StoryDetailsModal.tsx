import { Story } from '@/app/types/investment';
import { SentimentBadge, MaturityBadge } from './Badge';
import { X, Clock, Tag, TrendingUp, AlertCircle, Lightbulb, BarChart3, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

// Simple markdown-like text formatter
function formatMarkdown(text: string) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('###')) {
      elements.push(
        <h4 key={index} className="text-[15px] font-semibold text-[var(--fintech-text-primary)] mt-4 mb-2">
          {trimmed.replace(/^###\s*/, '')}
        </h4>
      );
    } else if (trimmed.startsWith('##')) {
      elements.push(
        <h3 key={index} className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mt-5 mb-2">
          {trimmed.replace(/^##\s*/, '')}
        </h3>
      );
    } else if (trimmed.startsWith('#')) {
      elements.push(
        <h2 key={index} className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mt-6 mb-3">
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
    }
    // Bold text
    else if (trimmed.includes('**')) {
      const parts = trimmed.split('**');
      elements.push(
        <p key={index} className="text-[14px] text-[var(--fintech-text-secondary)] leading-relaxed mb-2">
          {parts.map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-semibold text-[var(--fintech-text-primary)]">{part}</strong> : part
          )}
        </p>
      );
    }
    // Bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={index} className="text-[14px] text-[var(--fintech-text-secondary)] ml-4 mb-1">
          {trimmed.replace(/^[-*]\s*/, '')}
        </li>
      );
    }
    // Empty lines
    else if (trimmed === '') {
      elements.push(<div key={index} className="h-2" />);
    }
    // Regular text
    else if (trimmed.length > 0) {
      elements.push(
        <p key={index} className="text-[14px] text-[var(--fintech-text-secondary)] leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    }
  });
  
  return <div>{elements}</div>;
}

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

          {/* Gemini Strategic Intelligence Report */}
          {story.subreport && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[var(--fintech-accent)]" />
                <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                  Gemini Strategic Intelligence Report
                </h3>
                <span className="ml-auto px-2 py-1 bg-[#EEF2FF] text-[var(--fintech-accent)] rounded text-[12px] font-medium">
                  AI-Generated Analysis
                </span>
              </div>
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#EEF2FF] border-2 border-[var(--fintech-accent)] rounded-lg p-6">
                {formatMarkdown(story.subreport)}
              </div>
            </div>
          )}

          {/* Key Analysis Insights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[var(--fintech-accent)]" />
              <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                Key Analysis Insights
              </h3>
            </div>
            <div className="bg-[var(--fintech-bg)] rounded-lg p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[var(--fintech-accent)] rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-medium text-[var(--fintech-text-primary)] mb-1">
                    Market Pattern Recognition
                  </p>
                  <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                    This story has been classified under the "{story.topic}" pattern with {story.updateCount} data points collected. 
                    The system has identified {story.relatedEntities.length} key entities involved in this development.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[var(--fintech-accent)] rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-medium text-[var(--fintech-text-primary)] mb-1">
                    Sentiment Trajectory
                  </p>
                  <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                    Current sentiment is {story.sentiment}. The story has evolved through {story.sentimentHistory.length} sentiment 
                    shifts, indicating {story.sentimentHistory.length > 3 ? 'significant market attention' : 'emerging market interest'}.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[var(--fintech-accent)] rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-medium text-[var(--fintech-text-primary)] mb-1">
                    Story Maturity Assessment
                  </p>
                  <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                    {story.maturity === 'Mature' 
                      ? 'This is a mature story with established patterns and sufficient data for high-confidence analysis. Investment decisions can be made with greater certainty.'
                      : 'This is a developing story with limited historical data. Exercise caution and wait for additional confirmation before making significant investment decisions.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Implications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[var(--fintech-accent)]" />
              <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                Investment Implications
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--fintech-bg)] rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-[13px] font-medium text-[var(--fintech-text-muted)] mb-2">OPPORTUNITIES</p>
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  {story.sentiment === 'positive' 
                    ? `Positive sentiment with ${story.updateCount} updates suggests growing momentum. Consider positions in related entities for medium-term gains.`
                    : story.sentiment === 'negative'
                    ? 'Negative sentiment may present contrarian opportunities for risk-tolerant investors once the story stabilizes.'
                    : 'Neutral sentiment indicates a wait-and-see approach. Monitor for directional clarity before committing capital.'}
                </p>
              </div>
              <div className="bg-[var(--fintech-bg)] rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-[13px] font-medium text-[var(--fintech-text-muted)] mb-2">RISKS</p>
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  {story.maturity === 'Developing'
                    ? 'Limited data points increase uncertainty. Volatility expected as the story develops. Size positions accordingly.'
                    : 'Mature story with established patterns. Risk of mean reversion if sentiment becomes too extreme.'}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-[var(--fintech-accent)]" />
              <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                Risk Assessment
              </h3>
            </div>
            <div className="bg-[var(--fintech-bg)] rounded-lg p-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[var(--fintech-text-secondary)]">Data Confidence</span>
                    <span className="text-[14px] font-medium text-[var(--fintech-text-primary)]">
                      {story.maturity === 'Mature' ? 'High' : 'Medium'}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[var(--fintech-border)]">
                    <div
                      className="bg-[var(--fintech-accent)] h-full"
                      style={{ width: story.maturity === 'Mature' ? '85%' : '45%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[var(--fintech-text-secondary)]">Volatility Risk</span>
                    <span className="text-[14px] font-medium text-[var(--fintech-text-primary)]">
                      {story.sentiment === 'neutral' ? 'Low' : 'Medium'}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[var(--fintech-border)]">
                    <div
                      className="bg-orange-500 h-full"
                      style={{ width: story.sentiment === 'neutral' ? '30%' : '60%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[var(--fintech-text-secondary)]">Information Quality</span>
                    <span className="text-[14px] font-medium text-[var(--fintech-text-primary)]">
                      {story.updateCount > 10 ? 'High' : 'Medium'}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[var(--fintech-border)]">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: story.updateCount > 10 ? '80%' : '50%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Maturity Progress */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[var(--fintech-accent)]" />
              <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                Story Maturity
              </h3>
            </div>
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
