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
import { ErrorMessage, LoadingSkeleton } from '../../ErrorBoundary';

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
    <div className="space-y-10">
      {/* Header - Professional Paper Style */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-12 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
          <div>
            <h1 className="text-4xl font-serif text-[#2c3e50] font-light tracking-tight mb-2">
              Market Intelligence Overview
            </h1>
            <p className="text-base text-[#6b7280] font-serif">
              Real-time analysis of financial news and market stories
            </p>
          </div>
        </div>
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
        <div className="bg-gradient-to-br from-white to-[#faf9f6] border border-[#e5e3df] rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#d4af37]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="text-sm text-[#6b7280] font-serif uppercase tracking-wider">
              Overall Market Sentiment
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/10 to-[#b8941f]/10 rounded-xl flex items-center justify-center border border-[#d4af37]/20">
              <TrendingUp className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <SentimentBadge sentiment={overallSentiment} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>

      {/* System Health Card - Professional Design */}
      <div className="bg-gradient-to-br from-white/80 to-[#faf9f6] backdrop-blur-sm border-2 border-[#e5e3df] rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#d4af37]/20">
          <div className="w-1 h-8 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
          <h2 className="text-2xl font-serif text-[#2c3e50] font-light">
            System Health
          </h2>
          {systemLoading && <span className="ml-auto text-sm text-[#6b7280] font-serif">Loading...</span>}
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
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-[#e5e3df] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-base font-serif text-[#2c3e50] font-medium">
                  Ingestion
                </span>
              </div>
              <div className="space-y-3">
                <SystemStatusBadge status={systemData.ingestion.status} />
                <p className="text-sm text-[#6b7280] font-serif">
                  Last update: {systemData.ingestion.lastUpdate}
                </p>
                <p className="text-base text-[#3d4f63] font-serif font-medium">
                  {systemData.ingestion.articlesProcessed.toLocaleString()} articles processed
                </p>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-[#e5e3df] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center border border-purple-200">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-base font-serif text-[#2c3e50] font-medium">
                  Analysis
                </span>
              </div>
              <div className="space-y-3">
                <SystemStatusBadge status={systemData.analysis.status} />
                <p className="text-sm text-[#6b7280] font-serif">
                  Last update: {systemData.analysis.lastUpdate}
                </p>
                <p className="text-base text-[#3d4f63] font-serif font-medium">
                  {systemData.analysis.analysisCount.toLocaleString()} analyses completed
                </p>
              </div>
            </div>

            {/* Memory */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-[#e5e3df] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border border-green-200">
                  <Layers className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-base font-serif text-[#2c3e50] font-medium">
                  Memory
                </span>
              </div>
              <div className="space-y-3">
                <SystemStatusBadge status={systemData.memory.status} />
                <p className="text-sm text-[#6b7280] font-serif">
                  Last update: {systemData.memory.lastUpdate}
                </p>
                <p className="text-base text-[#3d4f63] font-serif font-medium">
                  {systemData.memory.storiesTracked} stories tracked
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white/80 to-[#faf9f6] backdrop-blur-sm border-2 border-[#e5e3df] rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#d4af37]/20">
            <div className="w-1 h-8 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
            <h2 className="text-xl font-serif text-[#2c3e50] font-light">
              Recent Stories
            </h2>
          </div>

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
                  className="flex items-start gap-4 pb-4 border-b border-[#e5e3df] last:border-0 last:pb-0 hover:bg-white/50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37]/10 to-[#b8941f]/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#d4af37]/20">
                    <Activity className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-serif text-[#2c3e50] mb-2 line-clamp-2 leading-relaxed">
                      {story.title}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#6b7280] font-serif">
                        {story.lastUpdated}
                      </span>
                      <SentimentBadge sentiment={story.sentiment} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base text-[#6b7280] font-serif text-center py-8">No stories available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white/80 to-[#faf9f6] backdrop-blur-sm border-2 border-[#e5e3df] rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#d4af37]/20">
            <div className="w-1 h-8 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
            <h2 className="text-xl font-serif text-[#2c3e50] font-light">
              Quick Actions
            </h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onNavigate('analyzer')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] font-serif font-medium"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-base">Analyze Headline</span>
            </button>

            <button
              onClick={() => onNavigate('stories')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-[#faf9f6] text-[#2c3e50] rounded-xl transition-all border-2 border-[#e5e3df] hover:border-[#d4af37]/30 shadow-sm hover:shadow-md font-serif font-medium"
            >
              <Eye className="w-5 h-5" />
              <span className="text-base">View Stories</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-[#faf9f6] text-[#2c3e50] rounded-xl transition-all border-2 border-[#e5e3df] hover:border-[#d4af37]/30 shadow-sm hover:shadow-md font-serif font-medium"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-base">Edit Risk Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
