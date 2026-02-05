import { StatCard } from '../StatCard';
import { SystemStatusBadge, SentimentBadge } from '../Badge';
import {
  BarChart3,
  Activity,
  Bell,
  TrendingUp,
  Sparkles,
  Eye,
  UserCircle,
  Database,
  Zap,
  Layers,
} from 'lucide-react';
import { useApiContext } from '../../../services/apiContext'
import { ErrorMessage, LoadingSkeleton } from '../../ErrorBoundary'

type Page =
  | 'dashboard'
  | 'stories'
  | 'analyzer'
  | 'profile'
  | 'decision-logic'
  | 'system-status';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const apiContext = useApiContext();
  const { stories, systemStatus } = apiContext;
  const systemLoading = systemStatus.loading;
  const systemError = systemStatus.error;
  const systemData = systemStatus.data;

  // Calculate dashboard stats from stories
  const totalStories = stories.data.length;
  const activeStories = stories.data.filter((s) => s.updateCount > 0).length;
  const newUpdatesToday = stories.data.reduce((sum, s) => sum + s.updateCount, 0);
  const overallSentiment =
    stories.data.length > 0
      ? stories.data.filter((s) => s.sentiment === 'positive').length >
        stories.data.filter((s) => s.sentiment === 'negative').length
        ? 'positive'
        : stories.data.filter((s) => s.sentiment === 'negative').length >
          stories.data.filter((s) => s.sentiment === 'positive').length
          ? 'negative'
          : 'neutral'
      : 'neutral';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
          Market Intelligence Overview
        </h1>
        <p className="text-[15px] text-[var(--fintech-text-secondary)]">
          Real-time analysis of financial news and market stories
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Stories Tracked"
          value={totalStories}
          icon={BarChart3}
        />
        <StatCard title="Active Stories" value={activeStories} icon={Activity} />
        <StatCard
          title="New Updates Today"
          value={newUpdatesToday}
          icon={Bell}
          trend={{ value: '+3 from yesterday', positive: true }}
        />
        <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="text-[14px] text-[var(--fintech-text-secondary)] font-medium">
              Overall Market Sentiment
            </div>
            <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--fintech-accent)]" />
            </div>
          </div>
          <div className="mt-4">
            <SentimentBadge sentiment={overallSentiment} />
          </div>
        </div>
      </div>

      {/* System Health Card */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)]">
            System Health
          </h2>
          {systemLoading && <span className="text-[13px] text-[var(--fintech-text-muted)]">Loading...</span>}
        </div>

        {systemError ? (
          <ErrorMessage
            message={systemError.userMessage}
            onRetry={() => apiContext.actions.fetchSystemStatus()}
          />
        ) : systemLoading ? (
          <LoadingSkeleton count={3} height="h-24" />
        ) : systemData ? (
          <div className="grid grid-cols-3 gap-6">
            {/* Ingestion */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[var(--fintech-accent)]" />
                <span className="text-[15px] font-medium text-[var(--fintech-text-primary)]">
                  Ingestion
                </span>
              </div>
              <div className="space-y-2">
                <SystemStatusBadge status={systemData.ingestion.status} />
                <p className="text-[13px] text-[var(--fintech-text-muted)]">
                  Last update: {systemData.ingestion.lastUpdate}
                </p>
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  {systemData.ingestion.articlesProcessed.toLocaleString()} articles processed
                </p>
              </div>
            </div>

            {/* Analysis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--fintech-accent)]" />
                <span className="text-[15px] font-medium text-[var(--fintech-text-primary)]">
                  Analysis
                </span>
              </div>
              <div className="space-y-2">
                <SystemStatusBadge status={systemData.analysis.status} />
                <p className="text-[13px] text-[var(--fintech-text-muted)]">
                  Last update: {systemData.analysis.lastUpdate}
                </p>
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  {systemData.analysis.analysisCount.toLocaleString()} analyses completed
                </p>
              </div>
            </div>

            {/* Memory */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[var(--fintech-accent)]" />
                <span className="text-[15px] font-medium text-[var(--fintech-text-primary)]">
                  Memory
                </span>
              </div>
              <div className="space-y-2">
                <SystemStatusBadge status={systemData.memory.status} />
                <p className="text-[13px] text-[var(--fintech-text-muted)]">
                  Last update: {systemData.memory.lastUpdate}
                </p>
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  {systemData.memory.storiesTracked} stories tracked
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
          <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-5">
            Recent Stories
          </h2>

          {stories.loading ? (
            <LoadingSkeleton count={3} />
          ) : stories.error ? (
            <ErrorMessage
              message={stories.error.userMessage}
              onRetry={() => apiContext.actions.fetchStories()}
            />
          ) : stories.data.length > 0 ? (
            <div className="space-y-4">
              {stories.data.slice(0, 5).map((story) => (
                <div
                  key={story.id}
                  className="flex items-start gap-3 pb-4 border-b border-[var(--fintech-border)] last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-[var(--fintech-accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] text-[var(--fintech-text-primary)] mb-1 line-clamp-2">
                      {story.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[var(--fintech-text-muted)]">
                        {story.lastUpdated}
                      </span>
                      <SentimentBadge sentiment={story.sentiment} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[var(--fintech-text-muted)]">No stories available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
          <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-5">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate('analyzer')}
              className="w-full flex items-center gap-3 px-4 py-4 bg-[var(--fintech-accent)] hover:bg-[var(--fintech-accent-hover)] text-white rounded-lg transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[15px] font-medium">Analyze Headline</span>
            </button>

            <button
              onClick={() => onNavigate('stories')}
              className="w-full flex items-center gap-3 px-4 py-4 bg-[var(--fintech-bg)] hover:bg-[var(--fintech-border)] text-[var(--fintech-text-primary)] rounded-lg transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span className="text-[15px] font-medium">View Stories</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center gap-3 px-4 py-4 bg-[var(--fintech-bg)] hover:bg-[var(--fintech-border)] text-[var(--fintech-text-primary)] rounded-lg transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-[15px] font-medium">Edit Risk Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
